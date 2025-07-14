export declare function getUserCompanyId(supabaseUserId: string): Promise<number | null>;
export declare function verifyUserCompanyAccess(supabaseUserId: string, companyId: number): Promise<boolean>;
export declare function getOrCreateUserCompany(supabaseUserId: string, companyName?: string): Promise<number>;
