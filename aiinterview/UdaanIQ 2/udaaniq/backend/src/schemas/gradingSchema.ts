import Ajv from "ajv";

const ajv = new Ajv();

export const gradingSchema = {
  type: "object",
  required: ["score", "rubric", "feedback"],
  properties: {
    score: { type: "number", minimum: 0, maximum: 100 },
    rubric: {
      type: "object",
      required: ["correctness", "efficiency", "explainability"],
      properties: {
        correctness: { type: "number" },
        efficiency: { type: "number" },
        explainability: { type: "number" }
      }
    },
    feedback: { type: "string" },
    evidence: { type: "object" }
  }
};

export const validateGrading = ajv.compile(gradingSchema);