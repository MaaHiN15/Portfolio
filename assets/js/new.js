// skills set hover

const skill_set = document.querySelectorAll('.items');

console.log(skill_set)

function changeBehaviour(){
    const children = this.querySelectorAll('.ic')
    children.forEach(child => child.classList.add('ichover'));
}
function deleteBehaviour(){
    const children = this.querySelectorAll('.ic')
    children.forEach(child => child.classList.remove('ichover'));
}

skill_set.forEach(skill => skill.addEventListener('mouseover', changeBehaviour))
skill_set.forEach(skill => skill.addEventListener('mouseout', deleteBehaviour))
