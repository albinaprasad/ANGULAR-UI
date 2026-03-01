import { Injectable } from '@angular/core';
import { Institution, Semester, Subject, TeacherAssignment } from '../types/institution.types';

@Injectable({ providedIn: 'root' })
export class InstitutionService {

    private nextId = 1;

    private institutions: Institution[] = [];
    private semesters: Semester[] = [];
    private subjects: Subject[] = [];
    private teacherAssignments: TeacherAssignment[] = [];

    // ── Institutions ──────────────────────────
    getInstitutions(): Institution[] {
        return [...this.institutions];
    }

    createInstitution(name: string, code: string, address: string): Institution {
        const inst: Institution = { id: this.nextId++, name, code, address };
        this.institutions.push(inst);
        return inst;
    }

    // ── Semesters ─────────────────────────────
    getSemestersByInstitution(institutionId: number): Semester[] {
        return this.semesters.filter(s => s.institutionId === institutionId);
    }

    createSemester(institutionId: number, name: string, number: number): Semester {
        const sem: Semester = { id: this.nextId++, institutionId, name, number };
        this.semesters.push(sem);
        return sem;
    }

    // ── Subjects ──────────────────────────────
    getSubjectsBySemester(semesterId: number): Subject[] {
        return this.subjects.filter(s => s.semesterId === semesterId);
    }

    createSubject(semesterId: number, name: string, code: string): Subject {
        const sub: Subject = { id: this.nextId++, semesterId, name, code };
        this.subjects.push(sub);
        return sub;
    }

    // ── Teacher Assignments ───────────────────
    getTeacherAssignments(): TeacherAssignment[] {
        return [...this.teacherAssignments];
    }

    getAssignmentsForTeacher(teacherName: string): TeacherAssignment[] {
        return this.teacherAssignments.filter(a => a.teacherName === teacherName);
    }

    assignTeacher(teacherName: string, institutionId: number, semesterId: number, subjectId: number): TeacherAssignment {
        const assignment: TeacherAssignment = {
            id: this.nextId++,
            teacherName,
            institutionId,
            semesterId,
            subjectId
        };
        this.teacherAssignments.push(assignment);
        return assignment;
    }

    removeAssignment(id: number): void {
        this.teacherAssignments = this.teacherAssignments.filter(a => a.id !== id);
    }

    // ── Lookup helpers ────────────────────────
    getInstitutionById(id: number): Institution | undefined {
        return this.institutions.find(i => i.id === id);
    }

    getSemesterById(id: number): Semester | undefined {
        return this.semesters.find(s => s.id === id);
    }

    getSubjectById(id: number): Subject | undefined {
        return this.subjects.find(s => s.id === id);
    }

    /**
     * For the teacher dashboard: returns semesters + subjects
     * assigned to a given teacher (across all institutions).
     */
    getTeacherSemestersAndSubjects(teacherName: string): { semester: Semester; subjects: Subject[] }[] {
        const assignments = this.getAssignmentsForTeacher(teacherName);
        const semesterMap = new Map<number, Set<number>>();

        for (const a of assignments) {
            if (!semesterMap.has(a.semesterId)) {
                semesterMap.set(a.semesterId, new Set());
            }
            semesterMap.get(a.semesterId)!.add(a.subjectId);
        }

        const result: { semester: Semester; subjects: Subject[] }[] = [];
        for (const [semId, subjectIds] of semesterMap) {
            const sem = this.getSemesterById(semId);
            if (!sem) continue;
            const subs = [...subjectIds]
                .map(id => this.getSubjectById(id))
                .filter((s): s is Subject => !!s);
            result.push({ semester: sem, subjects: subs });
        }

        return result.sort((a, b) => a.semester.number - b.semester.number);
    }
}
