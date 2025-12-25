export interface TeamMember {
    id: number;
    name: string;
    role: string;
    subRole?: string;
    image: string;
    category: 'Owner' | 'Core Admin' | 'Head' | 'City Lead';
    socials?: {
        github?: string;
        linkedin?: string;
        instagram?: string;
    };
}

// Get basePath for production deployment
const basePath = process.env.NODE_ENV === 'production' ? '/DevPath' : '';

// Helper to generate placeholder image
const getPlaceholder = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

export const teamMembers: TeamMember[] = [
    // Owner
    {
        id: 1,
        name: "Aditya Patil",
        role: "Owner",
        subRole: "Community Head",
        image: getPlaceholder("Aditya Patil"),
        category: "Owner",
        socials: {
            github: "https://github.com/aditya948351"
        }
    },
    // Core Admins
    {
        id: 2,
        name: "Application Pending",
        role: "Technical Head",
        image: getPlaceholder("Application Pending"),
        category: "Head"
    },
    {
        id: 3,
        name: "Deb Mukherjee",
        role: "Core Admin",
        subRole: "Partnership Head",
        image: getPlaceholder("Deb Mukherjee"),
        category: "Core Admin"
    },
    {
        id: 4,
        name: "Pranav Khaire",
        role: "Core Admin",
        subRole: "Content & Graphics Lead",
        image: getPlaceholder("Pranav Khaire"),
        category: "Core Admin"
    },
    // Heads & Leads
    {
        id: 5,
        name: "Varun Mulay",
        role: "AIML Lead",
        image: getPlaceholder("Varun Mulay"),
        category: "Head"
    },
    {
        id: 6,
        name: "Sakshi Rote",
        role: "Management Head",
        image: getPlaceholder("Sakshi Rote"),
        category: "Head"
    },
    // City Leads
    {
        id: 7,
        name: "Amitosh Biswas",
        role: "City Lead",
        subRole: "Bangalore",
        image: getPlaceholder("Amitosh Biswas"),
        category: "City Lead"
    },
    {
        id: 8,
        name: "Aditya Patil",
        role: "City Lead",
        subRole: "Pune",
        image: getPlaceholder("Aditya Patil"),
        category: "City Lead"
    },
    {
        id: 9,
        name: "Prince",
        role: "City Lead",
        subRole: "Nagpur",
        image: getPlaceholder("Prince"),
        category: "City Lead"
    },
    {
        id: 10,
        name: "Deb Mukherjee",
        role: "City Lead",
        subRole: "Kolkata",
        image: getPlaceholder("Deb Mukherjee"),
        category: "City Lead"
    }
];
