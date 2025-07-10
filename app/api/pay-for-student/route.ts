import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ambassadorDataPath = path.resolve(process.cwd(), 'data', 'ambassadors');

async function readPanelFile(id: string) {
    const filePath = path.join(ambassadorDataPath, `${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
}

async function writePanelFile(id: string, data: any) {
    const filePath = path.join(ambassadorDataPath, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readStudentsFile(id: string) {
    const filePath = path.join(ambassadorDataPath, `${id}-students.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
}

async function writeStudentsFile(id: string, data: any) {
    const filePath = path.join(ambassadorDataPath, `${id}-students.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


export async function POST(request: Request) {
    try {
        const { ambassadorId, studentId } = await request.json();
        const paymentAmount = 9; // Her öğrenci için sabit 9$

        if (!ambassadorId || !studentId) {
            return NextResponse.json({ error: 'Ambassador and Student ID are required' }, { status: 400 });
        }

        // İlgili dosyaları oku
        const panelData = await readPanelFile(ambassadorId);
        const students = await readStudentsFile(ambassadorId);

        // 1. Bakiye kontrolü
        if (panelData.account.balance < paymentAmount) {
            return NextResponse.json({ error: 'Yetersiz bakiye.' }, { status: 400 });
        }

        // 2. Öğrenciyi bul ve durumunu güncelle
        const studentIndex = students.findIndex((s: any) => s.anonymousId === studentId);
        if (studentIndex === -1 || students[studentIndex].paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Öğrenci bulunamadı veya zaten ödenmiş.' }, { status: 404 });
        }
        students[studentIndex].paymentStatus = 'paid';

        // 3. Elçinin bakiyesini düşür
        panelData.account.balance -= paymentAmount;

        // 4. Güncellenmiş dosyaları kaydet
        await writePanelFile(ambassadorId, panelData);
        await writeStudentsFile(ambassadorId, students);

        // Başarı cevabı olarak güncel panel ve öğrenci listesini döndür
        return NextResponse.json({ success: true, updatedPanelData: panelData, updatedStudents: students });

    } catch (error) {
        console.error("Error processing student payment:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
