export default function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between">

      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-3xl font-semibold mt-2">{value}</h2>

    </div>
  );
}