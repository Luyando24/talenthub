export type Role = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: Role;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Education {
    school: string
    degree: string
    field_of_study: string
    start_date: string
    end_date?: string
    current: boolean
    description?: string
}

export interface WorkExperience {
    company: string
    position: string
    location?: string
    start_date: string
    end_date?: string
    current: boolean
    description?: string
}

export interface CandidateProfile extends Profile {
    resume_url?: string;
    linkedin_url?: string;
    skills: string[];
    bio?: string;
    location: string;
    phone_number?: string;
    education?: Education[];
    work_experience?: WorkExperience[];
}

export interface RecruiterProfile extends Profile {
    company_name: string;
    company_website?: string;
    is_approved: boolean;
    is_suspended: boolean;
}

export interface Job {
    id: string;
    recruiter_id: string;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary_range?: string;
    industry?: string;
    job_type: string;
    status: 'published' | 'drafted' | 'closed'; // published, drafted, closed
    created_at: string;
}
