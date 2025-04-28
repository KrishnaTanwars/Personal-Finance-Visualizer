import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        description: '',
        date: '',
        category: ''
    });
    const [editTransaction, setEditTransaction] = useState(null);
    const [error, setError] = useState('');
    const [budgets, setBudgets] = useState({
        Groceries: 0,
        Bills: 0,
        Entertainment: 0,
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({
            ...newTransaction,
            [name]: value,
        });
    };

    // Format number for currency
    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    // Add or update transaction
    const addTransaction = () => {
        if (!newTransaction.description || !newTransaction.amount || !newTransaction.date || !newTransaction.category) {
            setError('Please fill all fields');
            return;
        }

        if (isNaN(newTransaction.amount) || parseFloat(newTransaction.amount) <= 0) {
            setError('Amount must be a positive number');
            return;
        }

        if (editTransaction) {
            const updatedTransactions = transactions.map((transaction) =>
                transaction.id === editTransaction.id
                    ? { ...transaction, ...newTransaction }
                    : transaction
            );
            setTransactions(updatedTransactions);
            setEditTransaction(null);
        } else {
            // Ensure unique ID for each transaction
            const newTransactionId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
            setTransactions([ ...transactions, { ...newTransaction, id: newTransactionId } ]);
        }
        setError('');
        resetForm();
    };

    // Delete transaction
    const deleteTransaction = (id) => {
        setTransactions(transactions.filter((transaction) => transaction.id !== id));
    };

    // Edit transaction
    const handleEdit = (transaction) => {
        setNewTransaction(transaction);
        setEditTransaction(transaction);
    };

    // Reset form to initial state
    const resetForm = () => {
        setNewTransaction({ amount: '', description: '', date: '', category: '' });
    };

    // Get total expenses
    const getTotalExpenses = () => {
        return transactions.reduce((total, t) => total + parseFloat(t.amount), 0);
    };

    // Get category breakdown
    const getCategoryBreakdown = () => {
        return transactions.reduce((categories, t) => {
            categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
            return categories;
        }, {});
    };

    // Get total category budgets
    const getTotalBudgets = () => {
        return Object.values(budgets).reduce((total, amount) => total + parseFloat(amount), 0);
    };

    // Get category breakdown for budgeting
    const getBudgetBreakdown = () => {
        return Object.keys(budgets).map((category) => ({
            name: category,
            budget: budgets[category],
            spent: (getCategoryBreakdown()[category] || 0),
        }));
    };

    // Pie chart data (category breakdown)
    const categoryBreakdown = getCategoryBreakdown();
    const pieData = Object.keys(categoryBreakdown).map((category) => ({
        name: category,
        value: categoryBreakdown[category],
    }));

    // Colors for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Save transactions to localStorage
    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    // Save budgets to localStorage
    const saveBudgets = () => {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    };

    // Load transactions from localStorage
    const loadTransactions = () => {
        const storedTransactions = localStorage.getItem('transactions');
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        }
    };

    // Load budgets from localStorage
    const loadBudgets = () => {
        const storedBudgets = localStorage.getItem('budgets');
        if (storedBudgets) {
            setBudgets(JSON.parse(storedBudgets));
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadTransactions();
        loadBudgets();
    }, []);

    useEffect(() => {
        saveTransactions();
        saveBudgets();
    }, [transactions, budgets]);

    // Prepare data for the bar chart (monthly expenses)
    const monthlyExpenses = [
        { month: 'April', expenses: getTotalExpenses() },
    ];

    return (
        <div>
            <h1>Transaction List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.description}</td>
                            <td>{formatCurrency(transaction.amount)}</td>
                            <td>{transaction.date}</td>
                            <td>{transaction.category}</td>
                            <td>
                                <button onClick={() => handleEdit(transaction)}>Edit</button>
                                <button onClick={() => deleteTransaction(transaction.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>{editTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <div>
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={newTransaction.description}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={newTransaction.amount}
                    onChange={handleInputChange}
                />
                <input
                    type="date"
                    name="date"
                    value={newTransaction.date}
                    onChange={handleInputChange}
                />
                <select
                    name="category"
                    value={newTransaction.category}
                    onChange={handleInputChange}
                >
                    <option value="">Select Category</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                </select>
                <button onClick={addTransaction}>
                    {editTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
            </div>

            <h2>Transaction Summary</h2>
            <div>
                <p>Total Expenses: {formatCurrency(getTotalExpenses())}</p>
                <h3>Category Breakdown:</h3>
                <ul>
                    {Object.keys(categoryBreakdown).map((category) => (
                        <li key={category}>
                            {category}: {formatCurrency(categoryBreakdown[category])}
                        </li>
                    ))}
                </ul>
            </div>

            <h2>Monthly Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="expenses" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>

            <h2>Category Breakdown (Pie Chart)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            <h2>Budgeting</h2>
            <div>
                <h3>Set Monthly Budgets</h3>
                {Object.keys(budgets).map((category) => (
                    <div key={category}>
                        <label>{category}: </label>
                        <input
                            type="number"
                            value={budgets[category]}
                            onChange={(e) => {
                                setBudgets({
                                    ...budgets,
                                    [category]: e.target.value,
                                });
                            }}
                        />
                    </div>
                ))}
            </div>

            <h3>Budget vs Actual Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBudgetBreakdown()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#82ca9d" />
                    <Bar dataKey="spent" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
