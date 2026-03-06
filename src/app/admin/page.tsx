"use client";
import { useState, useEffect } from "react";
import { addKnowledge, getKnowledge, deleteKnowledge } from "../actions/chat";

export default function AdminPage() {
  const [knowledge, setKnowledge] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data on page open
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getKnowledge();
    setData(res);
  };

  const handleTrain = async () => {
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Unauthorized!"); return;
    }
    setLoading(true);
    await addKnowledge("Manual Admin Input", knowledge);
    setKnowledge("");
    fetchData(); // Refresh list
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteKnowledge(id);
      fetchData();
    }
  };

  return (
    <div className="p-10 bg-[#1a1a1a] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">AI Training Admin Panel</h1>
      
      {/* Input Section */}
      <div className="mb-10 p-6 bg-gray-900 rounded-lg max-w-2xl">
        <input type="password" placeholder="Admin Password" className="block w-full p-2 mb-4 bg-gray-800 rounded" onChange={(e) => setPassword(e.target.value)} />
        <textarea className="w-full p-4 mb-4 bg-gray-800 rounded" rows={4} value={knowledge} onChange={(e) => setKnowledge(e.target.value)} placeholder="Enter new knowledge..." />
        <button onClick={handleTrain} className="bg-emerald-600 px-6 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Train AI"}</button>
      </div>

      {/* Dynamic List Section */}
      <h2 className="text-xl mb-4">Existing Knowledge Base</h2>
      <div className="grid gap-4 max-w-2xl">
        {data.map((item) => (
          <div key={item.id} className="p-4 bg-gray-800 rounded flex justify-between items-center">
            <p className="text-sm truncate mr-4">{item.content}</p>
            <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}