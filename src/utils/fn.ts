import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";


const schema = {
    description: "Resume of a Developer",
    type: SchemaType.OBJECT,
    properties: {
        personal_info: {
            type: SchemaType.OBJECT,
            properties: {
                name: {
                    type: SchemaType.STRING,
                    description: "Name of the person",
                    nullable: false,
                },
                email: {
                    type: SchemaType.STRING,
                    description: "Email address",
                    nullable: false,
                },
                phone: {
                    type: SchemaType.STRING,
                    description: "Phone number",
                    nullable: false,
                },
                website: {
                    type: SchemaType.STRING,
                    description: "Personal website URL",
                    nullable: false,
                },
                linkedIn: {
                    type: SchemaType.STRING,
                    description: "LinkedIn profile URL",
                    nullable: false,
                },
                github: {
                    type: SchemaType.STRING,
                    description: "GitHub profile URL",
                    nullable: false,
                },
            },
            required: ["name", "email", "phone", "website", "linkedIn", "github"],
        },
        skills: {
            type: SchemaType.OBJECT,
            properties: {
                languages: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Programming languages known",
                },
                web_app_development: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Web and app development skills",
                },
                technologies: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                    description: "Other technologies and tools",
                },
            },
            required: ["languages", "web_app_development", "technologies"],
        },
        work_experience: {
            type: SchemaType.ARRAY,
            description: "List of work experiences",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    company: {
                        type: SchemaType.STRING,
                        description: "Company name",
                        nullable: false,
                    },
                    role: {
                        type: SchemaType.STRING,
                        description: "Job role or title",
                        nullable: false,
                    },
                    location: {
                        type: SchemaType.STRING,
                        description: "Job location",
                        nullable: false,
                    },
                    duration: {
                        type: SchemaType.STRING,
                        description: "Employment duration",
                        nullable: false,
                    },
                    responsibilities: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.STRING,
                        },
                        description: "List of responsibilities or achievements",
                    },
                },
                required: ["company", "role", "location", "duration", "responsibilities"],
            },
        },
        projects: {
            type: SchemaType.ARRAY,
            description: "List of projects",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: {
                        type: SchemaType.STRING,
                        description: "Project name",
                        nullable: false,
                    },
                    tagline: {
                        type: SchemaType.STRING,
                        description: "Project tagline",
                        nullable: false,
                    },
                    technologies: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.STRING,
                        },
                        description: "Technologies used in the project",
                    },
                    links: {
                        type: SchemaType.OBJECT,
                        properties: {
                            demo: {
                                type: SchemaType.STRING,
                                description: "Link to demo",
                                nullable: false,
                            },
                            live: {
                                type: SchemaType.STRING,
                                description: "Link to live project",
                                nullable: false,
                            },
                        },
                        required: ["demo", "live"],
                    },
                    features: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.STRING,
                        },
                        description: "Key features of the project",
                    },
                },
                required: ["name", "tagline", "technologies", "links", "features"],
            },
        },
        achievements: {
            type: SchemaType.ARRAY,
            description: "List of achievements",
            items: {
                type: SchemaType.STRING,
            },
        },
        education: {
            type: SchemaType.OBJECT,
            properties: {
                degree: {
                    type: SchemaType.STRING,
                    description: "Degree obtained",
                    nullable: false,
                },
                institution: {
                    type: SchemaType.STRING,
                    description: "Name of the institution",
                    nullable: false,
                },
                location: {
                    type: SchemaType.STRING,
                    description: "Location of the institution",
                    nullable: false,
                },
                duration: {
                    type: SchemaType.STRING,
                    description: "Duration of the course",
                    nullable: false,
                },
                cgpa: {
                    type: SchemaType.STRING,
                    description: "CGPA or equivalent grade",
                    nullable: false,
                },
            },
            required: ["degree", "institution", "location", "duration", "cgpa"],
        },
    },
    required: [
        "personal_info",
        "skills",
        "work_experience",
        "projects",
        "achievements",
        "education",
    ],
};

export const getPdfResumeContent = async (prompt) => {
    const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema as Schema,
        },
    });

    // Example usage:
    const result = await model.generateContent(prompt);
    console.log("result : ", result);

    const respData = result.response.text()
    const resJson = JSON.parse(respData)
    console.log("respData : ", resJson);
    return resJson;
}