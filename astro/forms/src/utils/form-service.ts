import { submissions } from "@wix/forms";
import { createClient, OAuthStrategy } from "@wix/sdk";

export interface FormData {
  teamName: string;
  ageGroup: string;
  skillLevel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequirements?: string;
}

type SubmissionResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export async function submitTournamentRegistration(
  formData: FormData
): Promise<SubmissionResult> {
  try {
    const requiredFields = ["teamName", "email"] as const;
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    const submission = {
      formId: "2fc1513a-7ad0-4a5e-a731-1d0fb6e0e7e1",
      submissions: {
        team_name: formData.teamName,
        age_group_1: formData.ageGroup,
        skill_level: formData.skillLevel,
        first_name_1536: formData.firstName,
        last_name_7eec: formData.lastName,
        email_8874: formData.email,
        phone_f28a: formData.phone,
        special_requirements_or_requests: formData.specialRequirements,
      },
    };

    const { status } = await submissions.createSubmission(submission);

    return {
      success: status === "PENDING" || status === "CONFIRMED",
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
