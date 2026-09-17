import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import Card from "react-bootstrap/Card";

function StudentProgressGraph({ quizzes }) {
  if (!quizzes || quizzes.length === 0) return null;

  // Transform data for chart
  const data = quizzes.map(q => ({
    name: q.title.length > 12
      ? q.title.slice(0, 12) + "..."
      : q.title,
    percentage: q.percentage
  }));

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <h6 className="mb-3">📊 Quiz Performance Overview</h6>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar
              dataKey="percentage"
              radius={[6, 6, 0, 0]}
              fill="#0d6efd"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}

export default StudentProgressGraph;
