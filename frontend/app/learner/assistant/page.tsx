import { AITrainerChat } from "@/components/ai-trainer/ai-trainer-chat";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function LearnerAITrainerPage() {
  return (
    <DashboardLayout expectedRole="Learner" immersive title="Formateur IA">
      <AITrainerChat />
    </DashboardLayout>
  );
}
