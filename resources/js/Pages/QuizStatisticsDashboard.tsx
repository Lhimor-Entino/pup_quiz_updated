import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BookOpen, Award, Target } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
const QuizStatisticsDashboard = () => {
  const { questions, categories, topLobbyCategory } = usePage().props
  const [totalEasyQuestion, setTotalEasyQuestion] = useState(0)
  const [totalAverageQuestion, setTotalAverageQuestion] = useState(0)
  const [byLevel, setByLevel] = useState<any>()
  const [categoriesQuestions, setCategoriesQuestions] = useState([])
  // Mock data - replace with your actual data source
  const [questionStats] = useState({
    byLevel: [
      { level: 'Beginner', count: 45, percentage: 35 },
      { level: 'Intermediate', count: 38, percentage: 30 },
      { level: 'Advanced', count: 28, percentage: 22 },
      { level: 'Expert', count: 17, percentage: 13 }
    ],
    total: 128,
    categories: [
      { name: 'Science', count: 32, color: '#f97316' },
      { name: 'History', count: 28, color: '#ea580c' },
      { name: 'Literature', count: 24, color: '#dc2626' },
      { name: 'Mathematics', count: 22, color: '#c2410c' },
      { name: 'Geography', count: 22, color: '#9a3412' }
    ]
  });
  const orangeShades = [
    "#f97316", // standard orange
    "#ea580c", // dark orange
    "#dc2626", // light orange
    "#c2410c", // pastel orange
    "#9a3412", // coral/orange

  ];
  useEffect(() => {
    if (!questions) return
    const easy = questions.filter(q => q.difficulty === "easy");
    const average = questions.filter(q => q.difficulty === "average");
    const hard = questions.filter(q => q.difficulty === "hard");

    const total = easy.length + average.length + hard.length;

    const toPercentage = (count: number) => total === 0 ? 0 : parseFloat(((count / total) * 100).toFixed(2));

    setByLevel([
      { level: 'Easy', count: easy.length, percentage: toPercentage(easy.length) },
      { level: 'Average', count: average.length, percentage: toPercentage(average.length) },
      { level: 'Hard', count: hard.length, percentage: toPercentage(hard.length) },
    ]);
  }, [questions])
  useEffect(() => {
    setCategoriesQuestions
    // Count questions per subject_id
    const questionCounts = questions?.reduce((acc, q) => {
      acc[q.subject_id] = (acc[q.subject_id] || 0) + 1;
      return acc;
    }, {});

const result = categories?.map((subject, index) => ({
  name: subject.subject_name,
  count: questionCounts[subject.id] || 0,
  color: orangeShades[Math.floor(Math.random() * orangeShades.length)]
}));
    setCategoriesQuestions(result)
  }, [categories, questions])
  const StatCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{typeof value == "string" ? value?.toUpperCase() : value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8 text-white/80" />
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col p-6">
        <div className='bg-white/80 backdrop-blur-sm grid grid-cols-1 rounded-xl shadow-lg p-6 gap-6'>
          {/* Sidebar */}


          {/* Main Dashboard Content */}
          <div className='col-span-5 space-y-6'>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-orange-800 tracking-tight">Quiz Statistics Dashboard</h1>
              <div className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Last updated: Today
              </div>
            </div>


            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Questions"
                value={questions?.length || 0}
                subtitle="Across all levels"
                gradient="from-orange-500 to-orange-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Level with Highest Correct Percentage"
                value={topLobbyCategory?.difficulty}
                subtitle={`${topLobbyCategory?.total_questions || 0} questions`}
                gradient="from-orange-600 to-orange-700"
              />
              <StatCard
                icon={Target}
                title="Categories"
                value={categories.length}
                subtitle="Active categories"
                gradient="from-orange-700 to-orange-800"
              />
              <StatCard
                icon={Award}
                title="Completion Rate"
                value="100%"
                subtitle="Average across levels"
                gradient="from-orange-800 to-orange-900"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Questions by Level */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-orange-200">
                <h3 className="text-xl font-semibold text-orange-800 mb-4">Questions by Difficulty Level</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byLevel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis
                      dataKey="level"
                      stroke="#ea580c"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#ea580c"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#orangeGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Questions by Category */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-orange-200">
                <h3 className="text-xl font-semibold text-orange-800 mb-4">Questions by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoriesQuestions}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {categoriesQuestions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoriesQuestions.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-orange-700">{category.name}</span>
                      </div>
                      <span className="font-semibold text-orange-800">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Level Breakdown */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-orange-200">
              <h3 className="text-xl font-semibold text-orange-800 mb-6">Detailed Level Breakdown</h3>
              <div className="space-y-4">
                {byLevel?.map((level, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {level.level.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-800">{level.level}</h4>
                        <p className="text-sm text-orange-600">{level.count} questions ({level.percentage}%)</p>
                      </div>
                    </div>
                    <div className="w-32 bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${level.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>

  );
};

export default QuizStatisticsDashboard;