import { Link } from "react-router-dom";
import { HiUsers, HiFilm } from "react-icons/hi";

export default function AdminDashboard() {
  const cards = [
    {
      title: "Manage Users",
      description: "View, ban, or delete users",
      icon: HiUsers,
      link: "/admin/users",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Manage Movies",
      description: "Add, edit, or remove custom movies",
      icon: HiFilm,
      link: "/admin/movies",
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">Manage your movie platform</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.bg} border border-border rounded-xl p-6 hover:border-indigo-500/50 transition-all group`}
          >
            <card.icon className={`${card.color} text-3xl mb-3`} />
            <h2 className="text-lg font-semibold text-foreground group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
              {card.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
