import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider } from "./state/session";
import Landing from "./pages/Landing";
import AppShell from "./components/AppShell";

const Home = lazy(() => import("./pages/app/Home"));
const PatientLists = lazy(() => import("./pages/app/PatientLists"));
const Schedule = lazy(() => import("./pages/app/Schedule"));
const InBasket = lazy(() => import("./pages/app/InBasket"));
const EDBoard = lazy(() => import("./pages/app/EDBoard"));
const BedBoard = lazy(() => import("./pages/app/BedBoard"));
const Pharmacy = lazy(() => import("./pages/app/Pharmacy"));
const Lab = lazy(() => import("./pages/app/Lab"));
const Imaging = lazy(() => import("./pages/app/Imaging"));
const Admin = lazy(() => import("./pages/app/Admin"));
const PatientSearch = lazy(() => import("./pages/app/PatientSearch"));
const Chart = lazy(() => import("./pages/app/chart/Chart"));
const Portal = lazy(() => import("./pages/app/Portal"));

function Loading() {
  return <div className="page"><div className="empty">Loading…</div></div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app"
        element={
          <SessionProvider>
            <AppShell />
          </SessionProvider>
        }
      >
        <Route index element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
        <Route path="lists" element={<Suspense fallback={<Loading />}><PatientLists /></Suspense>} />
        <Route path="schedule" element={<Suspense fallback={<Loading />}><Schedule /></Suspense>} />
        <Route path="inbox" element={<Suspense fallback={<Loading />}><InBasket /></Suspense>} />
        <Route path="ed" element={<Suspense fallback={<Loading />}><EDBoard /></Suspense>} />
        <Route path="beds" element={<Suspense fallback={<Loading />}><BedBoard /></Suspense>} />
        <Route path="pharmacy" element={<Suspense fallback={<Loading />}><Pharmacy /></Suspense>} />
        <Route path="lab" element={<Suspense fallback={<Loading />}><Lab /></Suspense>} />
        <Route path="imaging" element={<Suspense fallback={<Loading />}><Imaging /></Suspense>} />
        <Route path="admin/*" element={<Suspense fallback={<Loading />}><Admin /></Suspense>} />
        <Route path="search" element={<Suspense fallback={<Loading />}><PatientSearch /></Suspense>} />
        <Route path="chart/:id" element={<Navigate to="summary" replace />} />
        <Route path="chart/:id/:activity" element={<Suspense fallback={<Loading />}><Chart /></Suspense>} />
        <Route path="portal/*" element={<Suspense fallback={<Loading />}><Portal /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
