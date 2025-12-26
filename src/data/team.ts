export interface TeamMember {
    id: number;
    name: string;
    role: string;
    subRole?: string;
    image?: string;
    category: 'Owner' | 'Core Admin' | 'Head' | 'City Lead';
    socials?: {
        github?: string;
        linkedin?: string;
        instagram?: string;
    };
    responsibilities?: string[];
    managedBy?: string;
}



// Helper to generate placeholder image
const getPlaceholder = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

export const teamMembers: TeamMember[] = [
    // Owner
    {
        id: 1,
        name: "Aditya Patil",
        role: "Owner",
        subRole: "Community Head",
        image: "https://res.cloudinary.com/dsj0vaews/image/upload/v1766696323/aigt0lwwyqjlaso6bw7m.jpg",
        category: "Owner",
        socials: {
            github: "https://github.com/aditya948351",
            linkedin: "https://www.linkedin.com/in/aditya-patil-a7743a292/",
            instagram: "https://www.instagram.com/"
        }
    },
    // Core Admins
    {
        id: 3,
        name: "Deb Mukherjee",
        role: "Core Admin",
        subRole: "Partnership Head",
        image: "https://res.cloudinary.com/dsj0vaews/image/upload/v1766696374/d1yvkivbdly4at9m2uxk.jpg",
        category: "Core Admin"
    },
    {
        id: 4,
        name: "Pranav Khaire",
        role: "Core Admin",
        subRole: "Content & Graphics Lead",
        image: "https://res.cloudinary.com/dsj0vaews/image/upload/v1766696375/eh9qepgconelmzwmdjpc.jpg",
        category: "Core Admin"
    },
    {
        id: 2,
        name: "Application Pending",
        role: "Technical Head",
        category: "Core Admin",
        responsibilities: [
            "Lead Technical Strategy",
            "Mentor Developers",
            "Oversee Projects",
            "Ensure Code Quality"
        ],
        managedBy: "Community Head"
    },
    // Heads & Leads
    {
        id: 6,
        name: "Sakshi Rote",
        role: "Management Head",
        image: "https://res.cloudinary.com/dsj0vaews/image/upload/v1766775568/pwhvez0jzi8frqq10sia.jpg",
        category: "Head"
    },
    {
        id: 5,
        name: "Varun Mulay",
        role: "AIML Lead",
        image: getPlaceholder("Varun Mulay"),
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
        image: "https://res.cloudinary.com/dsj0vaews/image/upload/v1766696323/aigt0lwwyqjlaso6bw7m.jpg",
        category: "City Lead",
        socials: {
            linkedin: "https://www.linkedin.com/in/aditya-patil-a7743a292/",
            instagram: "https://www.instagram.com/"
        }
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
        image: "https://res.cloudinary.com/dsj0vaews/image/upload/v1766696374/d1yvkivbdly4at9m2uxk.jpg",
        category: "City Lead"
    },
    {
        id: 11,
        name: "Application Pending",
        role: "City Lead",
        category: "City Lead",
        responsibilities: [
            "Community Growth",
            "Event Management",
            "Student Mentorship",
            "Technical Workshops"
        ],
        managedBy: "Core Admins"
    },
    {
        id: 12,
        name: "Application Pending",
        role: "City Lead",
        subRole: "Mumbai",
        category: "City Lead",
        responsibilities: [
            "Community Growth",
            "Event Management",
            "Student Mentorship",
            "Technical Workshops"
        ],
        managedBy: "Core Admins"
    },
    {
        id: 13,
        name: "Application Pending",
        role: "City Lead",
        subRole: "Hyderabad",
        category: "City Lead",
        responsibilities: [
            "Community Growth",
            "Event Management",
            "Student Mentorship",
            "Technical Workshops"
        ],
        managedBy: "Core Admins"
    },
    {
        id: 14,
        name: "Application Pending",
        role: "City Lead",
        subRole: "New Delhi",
        category: "City Lead",
        responsibilities: [
            "Community Growth",
            "Event Management",
            "Student Mentorship",
            "Technical Workshops"
        ],
        managedBy: "Core Admins"
    },
    // State Leads
    ...[
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Kerala", "Madhya Pradesh", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Tripura", "Uttar Pradesh", "Uttarakhand"
    ].map((state, index) => ({
        id: 15 + index,
        name: "Application Pending",
        role: "City Lead",
        subRole: state,
        category: "City Lead" as const,
        responsibilities: [
            "Community Growth",
            "Event Management",
            "Student Mentorship",
            "Technical Workshops"
        ],
        managedBy: "Core Admins"
    }))
];
