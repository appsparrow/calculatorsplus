function addCourse() {
    const container = document.getElementById('courses-container');
    const courseEntry = document.createElement('div');
    courseEntry.className = 'course-entry';
    courseEntry.innerHTML = `
        <div class="input-group">
            <label class="input-label">Course Name</label>
            <input type="text" class="input-field course-name" placeholder="e.g., Math">
        </div>
        <div class="input-group">
            <label class="input-label">Credits</label>
            <input type="number" class="input-field course-credits" min="0" value="3">
        </div>
        <div class="input-group">
            <label class="input-label">Grade</label>
            <select class="input-field course-grade">
                <option value="4.0">A</option>
                <option value="3.7">A-</option>
                <option value="3.3">B+</option>
                <option value="3.0">B</option>
                <option value="2.7">B-</option>
                <option value="2.3">C+</option>
                <option value="2.0">C</option>
                <option value="1.7">C-</option>
                <option value="1.3">D+</option>
                <option value="1.0">D</option>
                <option value="0.0">F</option>
            </select>
        </div>
    `;
    container.appendChild(courseEntry);
}

function calculateGPA() {
    const courses = document.getElementsByClassName('course-entry');
    let totalPoints = 0;
    let totalCredits = 0;
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';

    for (let course of courses) {
        const name = course.querySelector('.course-name').value || 'Course';
        const credits = parseFloat(course.querySelector('.course-credits').value) || 0;
        const grade = parseFloat(course.querySelector('.course-grade').value) || 0;
        const points = credits * grade;

        if (credits > 0) {
            totalPoints += points;
            totalCredits += credits;

            // Add row to results table
            const row = resultsBody.insertRow();
            row.innerHTML = `
                <td>${name}</td>
                <td>${credits}</td>
                <td>${course.querySelector('.course-grade').selectedOptions[0].text}</td>
                <td>${points.toFixed(2)}</td>
            `;
        }
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    document.getElementById('gpa-result').textContent = gpa.toFixed(2);
    document.getElementById('credits-result').textContent = totalCredits;
}

// Initialize with one course entry
document.addEventListener('DOMContentLoaded', () => {
    addCourse();
});