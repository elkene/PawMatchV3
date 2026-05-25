export function translateResults(results) {
  const translations = {
    DOG: 'Perro',
    CAT: 'Gato',
    RABBIT: 'Conejo',
    BIRD: 'Ave',
    SMALL: 'Pequeño',
    MEDIUM: 'Mediano',
    LARGE: 'Grande',
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
  };

  return {
    species: results.species ? translations[results.species] : null,
    size: results.size ? translations[results.size] : null,
    energy: results.energy ? translations[results.energy] : null,
  };
}

export function answersToFilters(answers) {
  const filters = {};

  // Q1: Housing → Space → Energy preference
  if (answers.q1 === 'apartment') {
    filters.energy = 'LOW';
  } else if (answers.q1 === 'house_garden') {
    filters.energy = 'HIGH';
  }

  // Q2: Activity level → Energy match
  if (answers.q2 === 'sedentary') {
    filters.energy = 'LOW';
  } else if (answers.q2 === 'very_active') {
    filters.energy = 'HIGH';
  }

  // Q3: Preferred species
  const speciesMap = {
    dog: 'DOG',
    cat: 'CAT',
    rabbit: 'RABBIT',
    bird: 'BIRD',
  };
  if (answers.q3 && speciesMap[answers.q3]) {
    filters.species = speciesMap[answers.q3];
  }

  // Q4: Experience level (doesn't filter, just info)
  // Could store in user profile if authenticated

  // Q5: Preferred size
  const sizeMap = {
    small: 'SMALL',
    medium: 'MEDIUM',
    large: 'LARGE',
  };
  if (answers.q5 && sizeMap[answers.q5]) {
    filters.size = sizeMap[answers.q5];
  }

  return filters;
}

export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: '¿Cuál es tu tipo de vivienda?',
    options: [
      { value: 'apartment', label: 'Apartamento' },
      { value: 'house', label: 'Casa' },
      { value: 'house_garden', label: 'Casa con jardín amplio' },
    ],
  },
  {
    id: 'q2',
    question: '¿Cuál es tu nivel de actividad?',
    options: [
      { value: 'sedentary', label: 'Bajo (poco ejercicio)' },
      { value: 'moderate', label: 'Moderado' },
      { value: 'very_active', label: 'Muy activo (ejercicio diario)' },
    ],
  },
  {
    id: 'q3',
    question: '¿Qué especie de mascota prefieres?',
    options: [
      { value: 'dog', label: 'Perro' },
      { value: 'cat', label: 'Gato' },
      { value: 'rabbit', label: 'Conejo' },
      { value: 'bird', label: 'Ave' },
      { value: 'no_preference', label: 'Sin preferencia' },
    ],
  },
  {
    id: 'q4',
    question: '¿Tienes experiencia con mascotas?',
    options: [
      { value: 'no_experience', label: 'Ninguna' },
      { value: 'some_experience', label: 'Algo de experiencia' },
      { value: 'experienced', label: 'Muy experimentado' },
    ],
  },
  {
    id: 'q5',
    question: '¿Qué tamaño de mascota prefieres?',
    options: [
      { value: 'small', label: 'Pequeño' },
      { value: 'medium', label: 'Mediano' },
      { value: 'large', label: 'Grande' },
      { value: 'no_preference', label: 'Sin preferencia' },
    ],
  },
];
