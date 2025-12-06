// src/pages/DashboardPage.tsx
<<<<<<< HEAD
import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";

interface Wine {
  id: number;
  name: string;
  vintage?: string;
  varietal?: string;
  region?: string;
  notes?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loadingWines, setLoadingWines] = useState(true);
=======
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [wines, setWines] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
>>>>>>> 4848a43c7cbead93e46594932b9b7a5f7063185a

  useEffect(() => {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

<<<<<<< HEAD
    const fetchWines = async () => {
      try {
        const res = await fetch(`${API_BASE}/wines/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setWines(data);
      } catch (err) {
        console.error("Failed to fetch wines:", err);
      } finally {
        setLoadingWines(false);
      }
    };

    fetchWines();
  }, []);

  return (
    <MainLayout
      title="Wine Service Dashboard"
      subtitle="Tonight's overview at a glance"
    >
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            Total Wines
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: "#6B1F2F" }}
          >
            {loadingWines ? "…" : wines.length}
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            Active Tables
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: "#6B1F2F" }}
          >
            0
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            User Role
          </p>
          <p
            className="text-xl font-bold mt-2 capitalize"
            style={{ color: "#6B1F2F" }}
          >
            {user?.role || "Guest"}
          </p>
        </div>
      </div>

      {/* Quick cards / shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              color: "#6B1F2F",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            Tonight’s Focus
          </h2>
          <p className="text-sm text-gray-700">
            Use the top navigation to jump into Wine Inventory or Dinner
            Service. This dashboard will grow into your nightly summary: bottle
            counts, most-poured wines, and guest experience notes.
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              color: "#6B1F2F",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            Service Highlights
          </h2>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Track guest wine choices and add-ons in Dinner Service.</li>
            <li>Log allergies and substitutions for future visits.</li>
            <li>Keep wine inventory aligned with what is moving on the floor.</li>
          </ul>
        </div>
      </div>
    </MainLayout>
=======
    // Fetch data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    try {
      const [winesRes, tablesRes, guestsRes] = await Promise.all([
        fetch(`${API_BASE}/wines/`),
        fetch(`${API_BASE}/tables/`),
        fetch(`${API_BASE}/guests/`),
      ]);
      setWines(await winesRes.json());
      setTables(await tablesRes.json());
      setGuests(await guestsRes.json());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  return (
    <Layout>
      <div>
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '8px' }}>
            Welcome, {user?.username || 'Guest'}!
          </h1>
          <p style={{ color: '#B89968', fontSize: '16px' }}>
            Here's your service overview for today
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Total Wines
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#6B1F2F' }}>
                  {wines.length}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>🍾</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Tables
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#6B1F2F' }}>
                  {tables.length}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>🍽️</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Guests
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#6B1F2F' }}>
                  {guests.length}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>👥</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Your Role
                </p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#6B1F2F', textTransform: 'capitalize' }}>
                  {user?.role || 'Guest'}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>👤</div>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '16px' }}>
            Recent Wines
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {wines.slice(0, 3).map((wine) => (
              <div
                key={wine.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E8D4B8',
                  backgroundColor: '#F8F5F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#6B1F2F' }}>
                    {wine.name}
                  </h3>
                  <span style={{ fontSize: '24px' }}>🍷</span>
                </div>
                <p style={{ color: '#B89968', fontSize: '13px' }}>
                  {wine.vintage} • {wine.varietal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
>>>>>>> 4848a43c7cbead93e46594932b9b7a5f7063185a
  );
}
