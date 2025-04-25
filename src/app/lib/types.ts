import { GithubRepo } from "@/lib/github";

export const WEBSITE_NAME = "Wilson's Website";
export const EMAIL = "luke@wilsonriplag.com";
export const NAME = "WilsonIIRIP/LUKE"; // Make sure GithubRepo is exported or defined

export type ActivityEventType = 'creation' | 'activity';

export interface ActivityEvent {
    type: ActivityEventType;
    date: string; // ISO date string
    repo: GithubRepo;
    id: string; // Unique ID for React key prop
}