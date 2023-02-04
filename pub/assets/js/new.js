// skills set hover
const skill_set = document.querySelectorAll('.items');
function changeBehaviour(){
    this.classList.add('borderHover')
    const headchild = this.querySelector('h3')
    headchild.classList.add('headsHover');
    const children = this.querySelectorAll('.ic')
    children.forEach(child => child.classList.add('ichover'));}
function deleteBehaviour(){
    this.classList.remove('borderHover')
    const headchild = this.querySelector('h3')
    headchild.classList.remove('headsHover');
    const children = this.querySelectorAll('.ic')
    children.forEach(child => child.classList.remove('ichover'));}
skill_set.forEach(skill => skill.addEventListener('mouseover', changeBehaviour))
skill_set.forEach(skill => skill.addEventListener('mouseout', deleteBehaviour))



// contact form hover effect
const contact_hover = document.getElementById('contact-form');
const contact_childs = contact_hover.querySelectorAll('.form-control');
function contactHover(){this.style = "border: 2px solid #3C434B";}
contact_childs.forEach(child => child.addEventListener('click', contactHover))


// text shadow
const hero = document.getElementById('square');
const text = hero.querySelector('h1');
const walk = 80;
function shadow(e){
    const { offsetWidth : width , offsetHeight : height } = hero; 
    let {offsetX : x , offsetY : y} = e;
    if(this !== e.target){x = x + e.target.offsetLeft;y = y + e.target.offsetTop;}
    const xWalk = Math.round((x / width * walk ) - (walk /2))
    const yWalk = Math.round((y / height * walk ) - (walk /2))
    text.style.textShadow = `${xWalk}px ${yWalk}px 2px rgba(0, 0, 0, 0.218)`;}
hero.addEventListener('mousemove', shadow)