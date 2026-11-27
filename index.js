// const gradePoints = {
//     'A+': 4.0,
//     'A': 4.0,
//     'A-': 3.7,
//     'B+': 3.3,
//     'B': 3.0,
//     'B-': 2.7,
//     'C+': 2.3,
//     'C': 2.0,
//     'C-': 1.7,
//     'D+': 1.3,
//     'D': 1.0,
//     'D-': 0.7,
//     'F': 0.0
// };

console.log("Hello World");

const gradePoints = {
    'A+': 5.0,
    'A': 4.5,
    'B+': 4.0,
    'B': 3.5,
    'C+': 3.0,
    'C': 2.5,
    'D+': 2.0,
    'D': 1.5,
    'F': 0.0
};

console.log(Object.values(gradePoints));




const courseList = document.getElementById('course-list');
const formMessage = document.getElementById('form-message');
let nextCourseNumber = 1;

function createCourseRow() {
    const row = document.createElement('div');
    row.className = 'course-row';
    row.innerHTML = `
        <input type="text" class="course-name" aria-label="Course name" placeholder="e.g. Biology">
        <select class="course-grade" aria-label="Course grade">
            <option value="">Grade</option>
            ${Object.keys(gradePoints).map(grade => `<option value="${grade}">${grade}</option>`).join('')}
        </select>
        <input class="course-credits" type="number" min="0.01" step="0.01" value="3" placeholder="3" inputmode="decimal" aria-label="Credit hours">
        <button type="button" class="remove-course" aria-label="Remove course">×</button>
    `;
    row.dataset.courseNumber = nextCourseNumber;
    nextCourseNumber += 1;
    return row;
}

function readCourseData() {
    const courses = [];
    let hasInvalidCredits = false;

    courseList.querySelectorAll('.course-row').forEach(row => {
        const grade = row.querySelector('.course-grade').value;
        if (grade === '') {
            return;
        }

        const credits = Number(row.querySelector('.course-credits').value);
        if (!Number.isFinite(credits) || credits <= 0) {
            hasInvalidCredits = true;
            return;
        }

        courses.push({ grade, credits });
    });

    return { courses, hasInvalidCredits };
}

function calculateAverage(courses) {
    const credits = courses.reduce((total, course) => total + course.credits, 0);
    if (credits === 0) {
        return null;
    }

    const qualityPoints = courses.reduce(
        (total, course) => total + gradePoints[course.grade] * course.credits,
        0
    );

    return { gpa: qualityPoints / credits, credits };
}

function formatGpa(value) {
    return value.toFixed(2);
}

function updateResults() {
    const { courses, hasInvalidCredits } = readCourseData();
    const semester = calculateAverage(courses);
    const previousGpaInput = document.getElementById('previous-gpa').value.trim();
    const previousCreditsInput = document.getElementById('previous-credits').value.trim();
    const hasPreviousGpa = previousGpaInput !== '';
    const hasPreviousCredits = previousCreditsInput !== '';
    const previousGpa = Number(previousGpaInput);
    const previousCredits = Number(previousCreditsInput);
    const hasPartialPreviousRecord = hasPreviousGpa !== hasPreviousCredits;
    const hasInvalidPreviousRecord = hasPreviousGpa && hasPreviousCredits &&
        (!Number.isFinite(previousGpa) || previousGpa < 0 || previousGpa > 5 ||
            !Number.isFinite(previousCredits) || previousCredits <= 0);

    document.getElementById('course-count').textContent =
        `${courseList.children.length} ${courseList.children.length === 1 ? 'course' : 'courses'}`;

    const errors = [];
    if (hasInvalidCredits) {
        errors.push('Enter a credit value greater than zero for each graded course.');
    }
    if (hasPartialPreviousRecord) {
        errors.push('Enter both your previous GPA and completed credits, or leave both blank.');
    } else if (hasInvalidPreviousRecord) {
        errors.push('Previous GPA must be between 0 and 4, and completed credits must be greater than zero.');
    }
    formMessage.textContent = errors.join(' ');

    const semesterValue = document.getElementById('semester-gpa');
    const semesterCaption = document.getElementById('semester-caption');
    if (hasInvalidCredits) {
        semesterValue.textContent = '—';
        semesterCaption.textContent = 'Check the credit hours for your graded courses';
    } else if (semester) {
        semesterValue.textContent = formatGpa(semester.gpa);
        semesterCaption.textContent = `${semester.credits.toFixed(2)} credits counted`;
    } else {
        semesterValue.textContent = '—';
        semesterCaption.textContent = 'Add a graded course to get started';
    }

    const cumulativeValue = document.getElementById('cumulative-gpa');
    const cumulativeCaption = document.getElementById('cumulative-caption');
    if (hasInvalidCredits || hasPartialPreviousRecord || hasInvalidPreviousRecord) {
        cumulativeValue.textContent = '—';
        cumulativeCaption.textContent = 'Check your course and previous record details';
        return;
    }

    const cumulativeCourses = courses.slice();
    if (hasPreviousGpa && hasPreviousCredits) {
        cumulativeCourses.push({
            grade: 'previous',
            credits: previousCredits,
            qualityPoints: previousGpa * previousCredits
        });
    }

    const cumulativeCredits = cumulativeCourses.reduce((total, course) => total + course.credits, 0);
    if (cumulativeCredits === 0) {
        cumulativeValue.textContent = '—';
        cumulativeCaption.textContent = 'Based on your courses below';
        return;
    }

    const qualityPoints = cumulativeCourses.reduce((total, course) => {
        const coursePoints = course.qualityPoints ?? gradePoints[course.grade] * course.credits;
        return total + coursePoints;
    }, 0);
    cumulativeValue.textContent = formatGpa(qualityPoints / cumulativeCredits);
    cumulativeCaption.textContent = `${cumulativeCredits.toFixed(2)} total credits counted`;
}

document.getElementById('add-course').addEventListener('click', () => {
    courseList.appendChild(createCourseRow());
    updateResults();
    courseList.lastElementChild.querySelector('.course-name').focus();
});

// Here is where most of the Events are listened and interated
courseList.addEventListener('input', updateResults);
courseList.addEventListener('change', updateResults);
courseList.addEventListener('click', event => {
    const removeButton = event.target.closest('.remove-course');
    if (!removeButton) {
        return;
    }
 
    removeButton.closest('.course-row').remove();
    updateResults();
});

document.getElementById('previous-gpa').addEventListener('input', updateResults);
document.getElementById('previous-credits').addEventListener('input', updateResults);

for (let index = 0; index < 3; index += 1) {
    courseList.appendChild(createCourseRow());
}
updateResults();