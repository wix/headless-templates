import { submissions } from "@wix/forms";
import { FormFieldsWixIds, WIX_FORM_ID } from "./constants";

type SubmissionResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export async function submitTournamentRegistration(
  formData: Record<string, string>
): Promise<SubmissionResult> {
  try {
    const requiredFields = [
      FormFieldsWixIds.teamName,
      FormFieldsWixIds.email,
    ] as const;
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[FormFieldsWixIds.email])) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    const submission = {
      formId: WIX_FORM_ID,
      submissions: formData,
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
