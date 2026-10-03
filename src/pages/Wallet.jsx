import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [bal, tx] = await Promise.all([
      api.get("/wallet"),
      api.get("/transactions/my"),
    ]);
    setBalance(bal.data.data.balance);
    setTransactions(tx.data.data.transactions);
  };

  useEffect(() => { load(); }, []);

  const topup = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/wallet/topup", { amount: Number(amount) });
      setAmount("");
      setMessage("Wallet topped up (simulated).");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Top-up failed");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        <div className="border border-stone/30 rounded p-6 bg-white text-center">
          <p className="text-sm text-stone">Available balance</p>
          <p className="text-3xl font-bold text-green-700 mt-1">₦{balance?.toLocaleString() ?? "—"}</p>
        </div>

        {user?.role === "CLIENT" && (
          <form onSubmit={topup} className="border border-stone/30 rounded p-4 mt-4 bg-white space-y-3">
            <h3 className="font-semibold text-sm text-forest">Top up (simulated)</h3>
            {message && <p className="bg-slate-100 p-2 rounded text-sm">{message}</p>}
            <input className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              type="number" placeholder="Amount ₦" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <button className="w-full bg-forest text-white px-4 py-2 rounded text-sm hover:bg-stone">Add funds</button>
          </form>
        )}

        {user?.role === "FREELANCER" && (
          <p className="text-xs text-stone mt-4 bg-cream/60 border border-stone/20 rounded p-3">
            Your balance grows when clients approve your milestones. Only clients can add funds.
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <h2 className="font-semibold mb-3 text-forest">Transaction history</h2>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="border border-stone/30 rounded p-3 bg-white flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-forest">
                  {t.type === "MILESTONE_PAYMENT" ? "Milestone payment" : t.type}
                </p>
                <p className="text-xs text-stone">
                  with {t.counterparty?.name} · {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>
              <p className={`font-medium ${t.direction === "CREDIT" ? "text-green-700" : "text-red-600"}`}>
                {t.direction === "CREDIT" ? "+" : "−"}₦{t.amount?.toLocaleString()}
              </p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-stone text-sm text-center py-8">No transactions yet.</p>}
        </div>
      </div>
    </div>
  );
}