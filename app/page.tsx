export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome to your CRM dashboard</p>
      </div>

      {/* Placeholder Content similar to screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Contacts", value: "1,234", trend: "+20% from last month" },
          { label: "Total Companies", value: "567", trend: "+12% from last month" },
          { label: "Active Projects", value: "89", trend: "+5% from last month" },
          { label: "Revenue", value: "$45,231", trend: "+18% from last month" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card-bg p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{stat.label}</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-xs text-green-500">{stat.trend}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
