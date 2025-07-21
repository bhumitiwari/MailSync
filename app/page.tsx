
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Mail,
  RefreshCw,
  Sparkles,
  CheckSquare as CheckSquareIcon,
} from "lucide-react";
import { Session } from 'next-auth';

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.4,
      metalness: 0.1,
      wireframe: true,
    });
    const model = new THREE.Mesh(geometry, material);
    scene.add(model);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xddd6fe, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 3.5;

    const animate = () => {
      requestAnimationFrame(animate);
      model.rotation.x += 0.001;
      model.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute top-0 left-0 w-full h-full z-0 opacity-30"
    />
  );
};

type AnalysisResult = {
  sender: string;
  summary: string;
  action: string | null;
};

type TodoItem = {
  _id: string;
  text: string;
  sender: string;
};

type SelectedAction = {
  text: string;
  sender: string;
};

const Header = ({ session }: { session: Session | null }) => (
  <motion.header
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-20"
  >
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="bg-violet-600 p-2 rounded-lg"
          >
            <Mail className="text-white" />
          </motion.div>
          <span className="text-xl font-bold text-gray-800">MailSync</span>
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-gray-600 hover:text-violet-600"
              >
                Sign Out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  </motion.header>
);

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/50 backdrop-blur-md p-6 rounded-xl shadow-lg text-left"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-violet-500 text-white mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    <p className="mt-1 text-gray-600">{description}</p>
  </motion.div>
);

const HeroSection = () => (
  <div className="relative text-center pt-24 pb-16 overflow-hidden">
    <ThreeScene />
    <div className="relative z-10 container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-block px-4 py-1 mb-4 text-sm font-medium text-violet-700 bg-violet-100 rounded-full"
      >
        ✨ Powered by AI
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight"
      >
        Sync, Summarize, Act
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-4 max-w-2xl mx-auto text-lg text-gray-600"
      >
        Transform your email chaos into actionable insights. Our AI reads,
        summarizes, and suggests the perfect next actions.
      </motion.p>
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 10px 20px rgba(139, 92, 246, 0.25)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        onClick={() => signIn("google")}
        className="mt-8 px-8 py-3 text-lg font-medium text-white bg-violet-600 rounded-lg shadow-lg hover:bg-violet-700"
      >
        Sync Your Mail
      </motion.button>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <FeatureCard
          delay={0.8}
          icon={<RefreshCw />}
          title="Smart Sync"
          description="Connect your email account in one secure dashboard."
        />
        <FeatureCard
          delay={1.0}
          icon={<Sparkles />}
          title="AI Summaries"
          description="Get instant, intelligent summaries of your important emails."
        />
        <FeatureCard
          delay={1.2}
          icon={<CheckSquareIcon />}
          title="Smart Actions"
          description="AI suggests meetings, follow-ups, and priority responses."
        />
      </div>
    </div>
  </div>
);

const Dashboard = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const EmailAnalysis = ({
  results,
  selectedActions,
  onCheckboxChange,
  onSave,
  isLoading,
}: {
  results: AnalysisResult[];
  selectedActions: Map<string, SelectedAction>;
  onCheckboxChange: (action: SelectedAction) => void;
  onSave: () => void;
  isLoading: boolean;
}) => (
  <section>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Analysis</h2>
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 min-h-[200px]">
      <AnimatePresence>
        {results.length > 0 ? (
          <>
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg transition-all hover:shadow-md"
              >
                <p className="font-semibold text-gray-800">
                  From: {result.sender}
                </p>
                <p className="text-gray-600 mb-2">{result.summary}</p>
                {result.action && (
                  <div className="flex items-center mt-2 p-2 bg-violet-50 rounded-md">
                    <input
                      type="checkbox"
                      id={`action-${index}`}
                      className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      onChange={() =>
                        onCheckboxChange({
                          text: result.action!,
                          sender: result.sender,
                        })
                      }
                      checked={selectedActions.has(result.action!)}
                    />
                    <label
                      htmlFor={`action-${index}`}
                      className="ml-3 text-violet-800 font-medium"
                    >
                      {result.action}
                    </label>
                  </div>
                )}
              </motion.div>
            ))}
            {selectedActions.size > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onSave}
                className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700"
              >
                Add {selectedActions.size} item(s) to To-Do List
              </motion.button>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {isLoading
              ? "Fetching summaries..."
              : "No new emails to analyze. Click 'Refresh' to check again."}
          </p>
        )}
      </AnimatePresence>
    </div>
  </section>
);

const TodoList = ({
  items,
  onMarkAsDone,
  isLoading,
}: {
  items: TodoItem[];
  onMarkAsDone: (id: string) => void;
  isLoading: boolean;
}) => (
  <section>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your To-Do List</h2>
    <div className="bg-white p-6 rounded-lg shadow-lg min-h-[200px]">
      {isLoading ? (
        <p className="text-gray-500 text-center py-8">Loading tasks...</p>
      ) : (
        <AnimatePresence>
          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((todo) => (
                <motion.li
                  key={todo._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  layout
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <p className="text-black font-medium">{todo.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      From: {todo.sender}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onMarkAsDone(todo._id)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full self-center ml-4 flex-shrink-0"
                  >
                    Done
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Your to-do list is empty!
            </p>
          )}
        </AnimatePresence>
      )}
    </div>
  </section>
);

export default function Home() {
  const { data: session, status } = useSession();

  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedActions, setSelectedActions] = useState<
    Map<string, SelectedAction>
  >(new Map());

  const [isLoading, setIsLoading] = useState(false);
  const [isTodoListLoading, setIsTodoListLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTodos = useCallback(async () => {
    if (!session) return;
    setIsTodoListLoading(true);
    try {
      const response = await fetch("/api/todo");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch to-do list.");
      }
      const data = await response.json();
      setTodoList(data);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error(err);
        setError(errorMessage);
    } finally {
      setIsTodoListLoading(false);
    }
  }, [session]);

  const handleAnalyzeEmails = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setAnalysisResults([]);
    setSelectedActions(new Map());

    try {
      const response = await fetch("/api/summarize", { method: "POST" });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get analysis.");
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAnalysisResults(data.results);
        localStorage.setItem(
          "lastSyncDate",
          new Date().toISOString().split("T")[0]
        );
      } else {
        alert("No new emails with content found to analyze.");
      }
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTodos();
      const todayStr = new Date().toISOString().split("T")[0];
      const lastSync = localStorage.getItem("lastSyncDate");
      if (lastSync !== todayStr) {
        handleAnalyzeEmails();
      }
    }
  }, [status, fetchTodos, handleAnalyzeEmails]);

  const handleCheckboxChange = (action: SelectedAction) => {
    const newSelection = new Map(selectedActions);
    if (newSelection.has(action.text)) {
      newSelection.delete(action.text);
    } else {
      newSelection.set(action.text, action);
    }
    setSelectedActions(newSelection);
  };

  const handleSaveToDoList = async () => {
    if (selectedActions.size === 0) return;
    const itemsToSave = Array.from(selectedActions.values());
    try {
      await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToSave }),
      });
      await fetchTodos();
      setAnalysisResults([]);
      setSelectedActions(new Map());
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
    }
  };

  const handleMarkAsDone = async (todoId: string) => {
    const originalTodoList = [...todoList];
    setTodoList((currentTodos) =>
      currentTodos.filter((todo) => todo._id !== todoId)
    );
    try {
      const response = await fetch("/api/todo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todoId }),
      });
      if (!response.ok) throw new Error("Failed to mark as done.");
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        setTodoList(originalTodoList);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-white">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-fuchsia-100 to-indigo-300 font-sans">
      <Header session={session} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!session ? (
          <HeroSection />
        ) : (
          <Dashboard>
            <div className="text-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyzeEmails}
                disabled={isLoading}
                className="px-6 py-3 text-white bg-violet-600 rounded-lg shadow-lg hover:bg-violet-700 disabled:bg-violet-400 flex items-center justify-center mx-auto space-x-2"
              >
                <RefreshCw
                  className={`h-5 w-5 text-white ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                <span>{isLoading ? "Analyzing..." : "Refresh Summaries"}</span>
              </motion.button>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
                <p>Error: {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EmailAnalysis
                results={analysisResults}
                selectedActions={selectedActions}
                onCheckboxChange={handleCheckboxChange}
                onSave={handleSaveToDoList}
                isLoading={isLoading}
              />
              <TodoList
                items={todoList}
                onMarkAsDone={handleMarkAsDone}
                isLoading={isTodoListLoading}
              />
            </div>
          </Dashboard>
        )}
      </main>
    </div>
  );
}
