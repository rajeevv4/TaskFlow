import React, { useCallback, useEffect, useState } from "react";
import AddProjectModal from "./AddProjectModal";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [isModalOpen, setModalState] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const location = useLocation();

  // Extract active project ID from the path (e.g. "/:projectId")
  const activeProjectId = location.pathname.slice(1);

  const openModal = useCallback(() => {
    setModalState(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalState(false);
  }, []);

  const fetchProjectData = () => {
    axios
      .get("https://taskflow-lfo7.onrender.com/projects/")
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        console.error("Sidebar: error fetching projects", err);
      });
  };

  const fetchActivities = useCallback(() => {
    if (
      activeProjectId &&
      activeProjectId !== "login" &&
      activeProjectId !== "signup"
    ) {
      axios
        .get(
          `https://taskflow-lfo7.onrender.com/project/${activeProjectId}/activity`
        )
        .then((res) => {
          setActivities(res.data);
        })
        .catch((err) => {
          console.error("Sidebar: error fetching activities", err);
        });
    } else {
      setActivities([]);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchProjectData();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [activeProjectId, fetchActivities]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchProjectData();
      fetchActivities();
    };
    document.addEventListener("projectUpdate", handleUpdate);
    return () => {
      document.removeEventListener("projectUpdate", handleUpdate);
    };
  }, [fetchActivities]);

  return (
    <>
      {/* Drawer Backdrop Overlay for Mobile screens */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 shadow-xl md:shadow-none
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Navigation list */}
        <div className="flex-1 py-6 overflow-y-auto px-4">
          {/* General Navigation Links */}
          <div className="mb-6">
            <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Main
            </h4>
            <Link
              to="/"
              onClick={closeSidebar}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                location.pathname === "/"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Projects Headers */}
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={openModal}
              className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition"
              title="Add New Project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>

          {/* Projects List */}
          <ul className="space-y-1">
            {projects.map((project) => {
              const taskCount = project.task ? project.task.length : 0;
              const isActive = activeProjectId === project._id;
              return (
                <li key={project._id}>
                  <Link
                    to={`/${project._id}`}
                    onClick={closeSidebar}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 capitalize ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate mr-2">{project.title}</span>
                    {taskCount > 0 && (
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {taskCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Recent Activity Card */}
          {activeProjectId &&
            activeProjectId !== "login" &&
            activeProjectId !== "signup" && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Recent Activity</span>
                </h4>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 max-h-[250px] overflow-y-auto shadow-xs">
                  {activities.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No activities yet.
                    </p>
                  ) : (
                    <ul className="relative border-l border-slate-200 pl-3 ml-1.5 space-y-2.5">
                      {activities.map((act) => {
                        const formatRelativeTime = (timeStr) => {
                          const date = new Date(timeStr);
                          const now = new Date();
                          const diffMs = now - date;
                          const diffMins = Math.floor(diffMs / 60000);
                          if (diffMins < 1) return "just now";
                          if (diffMins < 60) return `${diffMins}m ago`;
                          const diffHours = Math.floor(diffMins / 60);
                          if (diffHours < 24) return `${diffHours}h ago`;
                          return date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          });
                        };

                        return (
                          <li key={act._id} className="relative text-[11px]">
                            {/* Bullet dot */}
                            <div className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />

                            {/* Message */}
                            <p className="text-slate-600 leading-snug capitalize break-words">
                              {act.message}
                            </p>

                            {/* Time */}
                            <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block">
                              {formatRelativeTime(act.createdAt)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Modals */}
        <AddProjectModal isModalOpen={isModalOpen} closeModal={closeModal} />
      </div>
    </>
  );
};

export default Sidebar;
