import { submissions } from "@wix/forms";
import { WIX_FORM_ID } from "./constants";

export type FormValues = Record<string, string | string[] | number | boolean>;

type SubmissionResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export async function submitFormRegistration(
  formValues: FormValues
): Promise<SubmissionResult> {
  try {
    const submission = {
      formId: WIX_FORM_ID,
      submissions: formValues,
    };

    const { _id, status } = await submissions.createSubmission(submission);

    return {
      success: status === "PENDING" || status === "CONFIRMED",
      id: _id ?? undefined,
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      success: false,
      error: "We couldn't submit your registration. Please try again later.",
    };
  }
}
