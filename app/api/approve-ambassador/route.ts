import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const applicationsFilePath = path.resolve(process.cwd(), 'data', 'ambassador-applications.json');
const ambassadorDataPath = path.resolve(process.cwd(), 'data', 'ambassadors');

const defaultPanelData = {
    performance: { totalStudents: 0, totalEarnings: 0, pendingEarnings: 0, thisMonthStudents: 0 },
    engagement: { recentActivities: [], monthlyStats: [], gradeDistribution: [] },
    gamification: { badges: [
        { name: "Bronze Ambassador", requirement: "50+ öğrenci", earned: false, progress: 0 },
        { name: "Silver Ambassador", requirement: "200+ öğrenci", earned: false, progress: 0 },
        { name: "Gold Ambassador", requirement: "500+ öğrenci", earned: false, progress: 0 },
        { name: "Diamond Ambassador", requirement: "1000+ öğrenci", earned: false, progress: 0 },
    ]},
    payment: { paymentInfo: { method: "", iban: "", paypal: "" }, paymentRequests: [], paymentHistory: [] },
    notifications: [{ id: "NOTIF-1", message: "Elçi paneline hoş geldiniz!", type: "info", isRead: false, createdAt: new Date().toISOString() }]
};

export async function POST(request: Request) {
    try {
        const { applicationId } = await request.json();
        if (!applicationId) { return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 }); }

        const applicationsData = await fs.readFile(applicationsFilePath, 'utf-8');
        const applications = JSON.parse(applicationsData);

        const applicationIndex = applications.findIndex((app: any) => app.id === applicationId);
        if (applicationIndex === -1) { return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 }); }

        const app = applications[applicationIndex];

        const newAmbassadorPanelData = {
            id: app.id,
            account: { status: 'active', packageName: app.packageName || 'N/A' },
            ambassadorInfo: { firstName: app.firstName, lastName: app.lastName, email: app.email, phone: app.phone, school: app.school, city: app.city, district: app.district, experience: app.experience, motivation: app.motivation, studentCount: app.studentCount },
            applicationLifecycle: { submittedAt: app.submittedAt, paymentDeclaredAt: app.paymentDeclaredAt, reviewedAt: new Date().toISOString(), reviewedBy: "Admin" },
            billingInfo: app.billingInfo || {},
            ...defaultPanelData
        };

        await fs.mkdir(ambassadorDataPath, { recursive: true });
        const newAmbassadorFilePath = path.join(ambassadorDataPath, `${applicationId}.json`);
        await fs.writeFile(newAmbassadorFilePath, JSON.stringify(newAmbassadorPanelData, null, 2), 'utf-8');

        applications[applicationIndex].status = 'active';
        await fs.writeFile(applicationsFilePath, JSON.stringify(applications, null, 2), 'utf-8');

        return NextResponse.json({ success: true, message: `Ambassador panel created for ${applicationId}` });
    } catch (error) {
        console.error("Error approving ambassador:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
