import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Landmark } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full border border-stone/40 rounded-lg p-2.5 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40";

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", bankName: "", accountNumber: "" });
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [bal, tx, wd] = await Promise.all([
      api.get("/wallet"),
      api.get("/transactions/my"),
      api.get("/withdrawals/my"),
    ]);
    setBalance(bal.data.data.balance);
    setTransactions(tx.data.data.transactions);
    setWithdrawals(wd.data.data.withdrawals);
  };

  useEffect(() => { load(); }, []);

  const topup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/wallet/topup", { amount: Number(topupAmount) });
      setTopupAmount("");
      setMessage("Wallet topped up (simulated).");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Top-up failed");
    }
  };

  const withdraw = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/wallet/withdraw", {
        amount: Number(withdrawForm.amount),
        bankName: withdrawForm.bankName,
        accountNumber: withdrawForm.accountNumber,
      });
      setWithdrawForm({ amount: "", bankName: "", accountNumber: "" });
      setShowWithdraw(false);
      setMessage("Withdrawal requested. Payout is simulated in this demo.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Withdrawal failed");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        <div className="border border-stone/30 rounded-2xl p-6 bg-white text-center">
          <p className="text-sm text-stone">Available balance</p>
          <p className="text-3xl font-bold text-green-700 mt-1">₦{balance?.toLocaleString() ?? "—"}</p>
          <button onClick={() => setShowWithdraw(!showWithdraw)}
            className="mt-4 inline-flex items-center gap-2 bg-forest text-white px-4 py-2 rounded-lg text-sm hover:bg-stone">
            <ArrowUpFromLine size={14} /> Withdraw funds
          </button>
        </div>

        {user?.role === "CLIENT" && (
          <form onSubmit={topup} className="border border-stone/30 rounded-2xl p-4 mt-4 bg-white space-y-3">
            <h3 className="font-semibold text-sm text-forest flex items-center gap-2">
              <ArrowDownToLine size={14} /> Top up (simulated)
            </h3>
            <input className={inputClass} type="number" placeholder="Amount ₦"
              value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} required />
            <button className="w-full bg-forest text-white px-4 py-2 rounded-lg text-sm hover:bg-stone">Add funds</button>
          </form>
        )}

        {showWithdraw && (
          <form onSubmit={withdraw} className="border border-stone/30 rounded-2xl p-4 mt-4 bg-white space-y-3">
            <h3 className="font-semibold text-sm text-forest flex items-center gap-2">
              <Landmark size={14} /> Withdraw to bank
            </h3>
            <p className="text-xs text-stone">Minimum ₦1,000. Payouts are simulated in this demo.</p>
            <input className={inputClass} type="number" placeholder="Amount ₦"
              value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} required />
            <input className={inputClass} placeholder="Bank name"
              value={withdrawForm.bankName} onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} required />
            <input className={inputClass} placeholder="Account number"
              value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })} required />
            <button className="w-full bg-forest text-white px-4 py-2 rounded-lg text-sm hover:bg-stone">Request withdrawal</button>
          </form>
        )}

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mt-4 text-sm">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mt-4 text-sm">{message}</p>}

        {withdrawals.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm text-forest mb-2">Withdrawal history</h3>
            <div className="space-y-2">
              {withdrawals.map((w) => (
                <div key={w.id} className="border border-stone/30 rounded p-3 bg-white text-sm flex justify-between">
                  <div>
                    <p className="text-forest font-medium">₦{w.amount?.toLocaleString()} → {w.bankName} {w.accountNumber}</p>
                    <p className="text-xs text-stone">{new Date(w.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded h-fit">{w.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <h2 className="font-semibold mb-3 text-forest">Transaction history</h2>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="border border-stone/30 rounded p-3 bg-white flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-forest">
                  {t.type === "MILESTONE_PAYMENT" ? "Milestone payment" : t.type === "WITHDRAWAL" ? "Withdrawal" : t.type}
                </p>
                <p className="text-xs text-stone">
                  {t.type === "WITHDRAWAL" ? "Payout to bank" : `with ${t.counterparty?.name}`} · {new Date(t.createdAt).toLocaleString()}
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