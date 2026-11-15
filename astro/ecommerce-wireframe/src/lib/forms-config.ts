// Form ids are structural (the frontend binds to them); everything else about
// each form — fields, labels, required, order — is read live from its schema,
// so the owner edits the forms in Dashboard → Forms with no code change.
// These ids are the Newsletter and Contact forms provisioned by this template's
// Wix site template; if you rebuild the forms, copy the new ids from Dashboard → Forms.
export const FORM_IDS = {
  newsletter: "36f4e163-1fab-4988-95ca-71a6edf7e894",
  contact: "68b30fc2-e7f3-41ac-945a-41ff674ded4e",
} as const;
