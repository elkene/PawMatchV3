export default function EmptyState({ icon, title, description }) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
