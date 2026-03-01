export interface Institution {
    id: number;
    name: string;
    code: string;
    address: string;
}

export interface Semester {
    id: number;
    institutionId: number;
    name: string;
    number: number;
}

export interface Subject {
    id: number;
    semesterId: number;
    name: string;
    code: string;
}

export interface TeacherAssignment {
    id: number;
    teacherName: string;
    institutionId: number;
    semesterId: number;
    subjectId: number;
}
