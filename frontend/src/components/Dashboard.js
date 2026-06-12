import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AddProjectModal from "./AddProjectModal";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const fetchProjects = useCallback(() => {
    axios
      .get("https://taskflow-lfo7.onrender.com/projects/")
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        console.error("Dashboard: Error fetching projects", err);
        toast.error("Failed to load projects");
      });
  }, []);

  useEffect(() => {
    fetchProjects();
    document.addEventListener("projectUpdate", fetchProjects);
    return () => {
      document.removeEventListener("projectUpdate", fetchProjects);
    };
  }, [fetchProjects]);

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you want to delete this project? All associated tasks will be lost."
      )
    ) {
      try {
        const res = await axios.delete(
          `https://taskflow-lfo7.onrender.com/project/${projectId}`
        );
        if (res.data.deletedCount > 0) {
          toast.success("Project deleted successfully");
          // Dispatch event to update sidebar and dashboard
          const customEvent = new CustomEvent("projectUpdate");
          document.dispatchEvent(customEvent);
        } else {
          toast.error("Project already deleted");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete project");
      }
    }
  };

  const handleEditProject = (e, projectId) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedProjectId(projectId);
    setEditModalOpen(true);
  };

  const handleExportReport = async (e, projectId, projectTitle) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await axios.get(
        `https://taskflow-lfo7.onrender.com/project/${projectId}/report`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `TaskFlow-Report-${projectTitle.replace(/[^a-zA-Z0-9]/g, "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report exported successfully");
    } catch (err) {
      console.error("Dashboard: Export report error", err);
      toast.error("Failed to export report");
    }
  };

  // Calculations for overall dashboard statistics
  const totalProjects = projects.length;
  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasks = 0;

  projects.forEach((project) => {
    const tasks = project.task || [];
    totalTasks += tasks.length;
    tasks.forEach((task) => {
      if (task.stage === "Done") {
        completedTasks++;
      } else {
        pendingTasks++;
      }
    });
  });

  return (
    <div className="w-full px-6 py-8 overflow-y-auto h-[calc(100vh-56px)] bg-slate-50/50">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and track your projects, tasks, and productivity.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span>New Project</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A9 9 0 0112 3v8.25m0 0h7.5A2.25 2.25 0 0118 13.5h-5.25v5.25a2.25 2.25 0 01-2.25-2.25v-3.75z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Projects</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {totalProjects}
            </h3>
          </div>
        </div>

        {/* Total Tasks Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-violet-50 rounded-lg text-violet-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalTasks}</h3>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Completed Tasks
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {completedTasks}
            </h3>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {pendingTasks}
            </h3>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3c.235-.083.487-.128.75-.128H19.5A2.25 2.25 0 0121.75 9v11.25a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25h.75"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              No projects found
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Get started by creating your first project to organize your
              workflows.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-150"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const tasks = project.task || [];
              const projTotal = tasks.length;
              const projCompleted = tasks.filter(
                (t) => t.stage === "Done"
              ).length;
              const projPending = projTotal - projCompleted;
              const progressPercent =
                projTotal > 0
                  ? Math.round((projCompleted / projTotal) * 100)
                  : 0;

              // Count task priorities
              let highPriority = 0;
              let medPriority = 0;
              let lowPriority = 0;
              tasks.forEach((t) => {
                if (t.priority === "High") highPriority++;
                else if (t.priority === "Medium") medPriority++;
                else if (t.priority === "Low") lowPriority++;
              });

              return (
                <Link
                  key={project._id}
                  to={`/${project._id}`}
                  className="block bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 group relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors capitalize pr-12 truncate">
                      {project.title}
                    </h3>
                    <div className="flex items-center space-x-1 absolute right-6 top-6">
                      <button
                        onClick={(e) =>
                          handleExportReport(e, project._id, project.title)
                        }
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Export Report"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleEditProject(e, project._id)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                        title="Edit Project"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, project._id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Project"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 capitalize h-10">
                    {project.description || "No description provided."}
                  </p>

                  {/* Task completion progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Task Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Task Breakdown stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg text-xs text-center border border-slate-100 mb-4">
                    <div>
                      <span className="block text-slate-400 font-medium mb-0.5">
                        Tasks
                      </span>
                      <span className="font-semibold text-slate-700">
                        {projTotal}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium mb-0.5">
                        Completed
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {projCompleted}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium mb-0.5">
                        Pending
                      </span>
                      <span className="font-semibold text-amber-600">
                        {projPending}
                      </span>
                    </div>
                  </div>

                  {/* Priority Counts summary */}
                  <div className="flex items-center space-x-2 text-xs">
                    {highPriority > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600 border border-red-100">
                        High: {highPriority}
                      </span>
                    )}
                    {medPriority > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 border border-amber-100">
                        Medium: {medPriority}
                      </span>
                    )}
                    {lowPriority > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Low: {lowPriority}
                      </span>
                    )}
                    {projTotal === 0 && (
                      <span className="text-slate-400 italic">
                        No tasks added yet
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProjectModal
        isModalOpen={isCreateModalOpen}
        closeModal={() => setCreateModalOpen(false)}
      />
      {isEditModalOpen && (
        <AddProjectModal
          isModalOpen={isEditModalOpen}
          closeModal={() => {
            setEditModalOpen(false);
            setSelectedProjectId(null);
          }}
          edit={true}
          id={selectedProjectId}
        />
      )}
    </div>
  );
};

export default Dashboard;
