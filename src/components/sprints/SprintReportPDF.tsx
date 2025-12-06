import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#8b5cf6",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: "#64748b",
    width: "30%",
    fontWeight: "bold",
  },
  value: {
    fontSize: 10,
    color: "#1e293b",
    width: "70%",
  },
  taskItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    paddingVertical: 4,
  },
  taskTitle: {
    fontSize: 10,
    color: "#1e293b",
    flex: 1,
  },
  taskStatus: {
    fontSize: 9,
    color: "#10b981",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  metricCard: {
    width: "23%",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metricLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8b5cf6",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  text: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.5,
  },
});

interface Task {
  id: string;
  code: string;
  title: string;
  status: string;
  estimated_hours: number | null;
}

interface SprintReportData {
  sprint: {
    code: string;
    name: string;
    goal: string | null;
    start_date: string;
    end_date: string;
    status: string;
  };
  tasks: Task[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    plannedHours: number;
    completedHours: number;
    velocity: number;
  };
  retrospective?: string;
}

export function SprintReportPDF({ data }: { data: SprintReportData }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Sprint</Text>
          <Text style={styles.subtitle}>
            {data.sprint.code} - {data.sprint.name}
          </Text>
        </View>

        {/* Sprint Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Sprint</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Período:</Text>
            <Text style={styles.value}>
              {formatDate(data.sprint.start_date)} até{" "}
              {formatDate(data.sprint.end_date)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{data.sprint.status}</Text>
          </View>
          {data.sprint.goal && (
            <View style={styles.row}>
              <Text style={styles.label}>Objetivo:</Text>
              <Text style={styles.value}>{data.sprint.goal}</Text>
            </View>
          )}
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Tarefas</Text>
              <Text style={styles.metricValue}>{data.metrics.totalTasks}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Concluídas</Text>
              <Text style={styles.metricValue}>
                {data.metrics.completedTasks}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Horas Planejadas</Text>
              <Text style={styles.metricValue}>
                {data.metrics.plannedHours}h
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Velocidade</Text>
              <Text style={styles.metricValue}>{data.metrics.velocity}%</Text>
            </View>
          </View>
        </View>

        {/* Completed Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarefas Concluídas</Text>
          {data.tasks
            .filter((t) => t.status === "done")
            .map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskTitle}>
                  {task.code} - {task.title}
                </Text>
                <Text style={styles.taskStatus}>
                  {task.estimated_hours ? `${task.estimated_hours}h` : "-"}
                </Text>
              </View>
            ))}
          {data.tasks.filter((t) => t.status === "done").length === 0 && (
            <Text style={styles.text}>Nenhuma tarefa concluída</Text>
          )}
        </View>

        {/* Retrospective */}
        {data.retrospective && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Retrospectiva</Text>
            <Text style={styles.text}>{data.retrospective}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Gerado em {new Date().toLocaleString("pt-BR")} - ERP UzzAI
        </Text>
      </Page>
    </Document>
  );
}
