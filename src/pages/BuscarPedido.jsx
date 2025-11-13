export default function BuscarPedido() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6">Buscar Pedido</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o DNI..."
        className="w-full p-4 text-lg rounded-xl bg-zinc-800 border border-zinc-600 text-white"
      />
    </div>
  );
}
