import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { QUIZ_QUESTIONS, answersToFilters, translateResults } from '@/lib/quiz-logic';
import PetDetailModal from '@/components/pets/PetDetailModal';

export default function Quiz() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stage, setStage] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [resultsPets, setResultsPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const handleStartQuiz = () => {
    setStage('questions');
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/pets/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites.map(f => f.petId));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFavorite = async (petId) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    const isFavorite = favorites.includes(petId);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const res = await fetch(`/api/pets/${petId}/favorite`, { method });

      if (res.ok) {
        if (isFavorite) {
          setFavorites(favorites.filter(id => id !== petId));
        } else {
          setFavorites([...favorites, petId]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    const filters = answersToFilters(answers);

    const params = new URLSearchParams({
      limit: 12,
      ...(filters.species && { species: filters.species }),
      ...(filters.size && { size: filters.size }),
      ...(filters.energy && { energy: filters.energy }),
    });

    try {
      const res = await fetch(`/api/pets?${params}`);
      const data = await res.json();
      setResultsPets(data.pets || []);
      const translatedResults = translateResults(filters);
      setResults(translatedResults);
      if (session?.user?.id) {
        fetchFavorites();
      }
      setStage('results');
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {stage === 'intro' && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">Test de Compatibilidad</h1>
              <p className="text-xl text-gray-600 mb-8">
                Descubre la mascota perfecta para ti respondiendo algunas preguntas simples
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold text-lg mb-3">¿Cómo funciona?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>- Responde 5 preguntas sobre tu estilo de vida</li>
                  <li>- Conoce tus preferencias de mascota</li>
                  <li>- Descubre mascotas que se adapten a ti</li>
                  <li>- Puedes favoritar tus favoritas</li>
                </ul>
              </div>

              <button
                onClick={handleStartQuiz}
                className="bg-primary text-white font-bold py-4 px-12 rounded-lg text-xl hover:bg-primary/90 transition"
              >
                Comenzar Test
              </button>
            </div>
          )}

          {stage === 'questions' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-block bg-primary text-white px-4 py-2 rounded-full">
                  Pregunta {Object.keys(answers).length + 1} de {QUIZ_QUESTIONS.length}
                </div>
              </div>

              {QUIZ_QUESTIONS.map((question, idx) => (
                <div
                  key={question.id}
                  className={`bg-white rounded-lg shadow-lg p-8 ${
                    Object.keys(answers).length >= idx ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.question}</h2>

                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(question.id, option.value)}
                        className={`w-full p-4 rounded-lg font-semibold transition text-left border-2 ${
                          answers[question.id] === option.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 justify-between">
                <button
                  onClick={() => {
                    setStage('intro');
                    setAnswers({});
                  }}
                  className="px-8 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
                >
                  Volver
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length}
                  className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ver Resultados
                </button>
              </div>
            </div>
          )}

          {stage === 'results' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4"> Tus Resultados</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                  {results.species && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Especie</p>
                      <p className="text-xl font-bold text-primary">{results.species}</p>
                    </div>
                  )}
                  {results.size && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Tamaño</p>
                      <p className="text-xl font-bold text-green-700">{results.size}</p>
                    </div>
                  )}
                  {results.energy && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">Energía</p>
                      <p className="text-xl font-bold text-orange-700">{results.energy}</p>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-lg mb-6">
                  Encontramos {resultsPets.length} {resultsPets.length === 1 ? 'mascota' : 'mascotas'} que coinciden con tu perfil
                </p>

                {resultsPets.length > 0 && (
                  <button
                    onClick={() => router.push('/search')}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
                  >
                    Ver Mascotas Compatibles
                  </button>
                )}
              </div>

              {resultsPets.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">Mascotas para Ti</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resultsPets.slice(0, 6).map((pet) => (
                      <div
                        key={pet.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                        onClick={() => setSelectedPet(pet)}
                      >
                        {pet.image && (
                          <img
                            src={pet.image}
                            alt={pet.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{pet.name}</h3>
                          <p className="text-gray-600 text-sm">
                            {pet.breed} • {pet.species}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {pet.age} años • {pet.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStage('intro')}
                  className="flex-1 px-8 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
                >
                  Hacer Test Nuevamente
                </button>
                <button
                  onClick={() => router.push('/search')}
                  className="flex-1 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
                >
                  Explorar Todas las Mascotas
                </button>
              </div>
            </div>
          )}

          {selectedPet && (
            <PetDetailModal
              pet={selectedPet}
              isFavorite={favorites.includes(selectedPet.id)}
              onFavorite={() => handleFavorite(selectedPet.id)}
              onClose={() => setSelectedPet(null)}
            />
          )}
        </div>
    </div>
  );
}
