let fieldset = document.getElementsByTagName("fieldset")[0]
let reset = document.getElementById('resetbutton');
let form = document.getElementsByTagName('form')[0];
let addButton = document.getElementById("Add");
let inputs = document.querySelectorAll(".entry>input, .entry>textarea, .entry>select");

reset.addEventListener("click", resetform, true);

//input event loop
inputs.forEach(input => {
    let img = document.createElement('img')
    img.setAttribute('class', "wrong")
    img.setAttribute('id', input.id + "-img")
    img.setAttribute('src', "images/wrong.png")
    div = document.createElement('div')
    div.className = "imgwrap"
    div.appendChild(img)
    input.parentElement.appendChild(div)

    if (input.id == "shortdescription") {
        input.parentElement.children[0].appendChild(div);
    }
    input.addEventListener("input", formValidation);
    formValidation(input);
})

//handler
function formValidation(e) {
    if (e.target != null) { e = e.target; }
    if (document.getElementById('em-' + e.id) != null) {
        document.getElementById('em-' + e.id).remove();
    }
    let img = document.getElementById(e.id + "-img");
    if (e.validity.valid) {
        img.class = "correct";
        img.src = "images/right.png";
    } else if (!e.validity.valid) {
        img.class = 'wrong';
        img.src = "images/wrong.png";
        errorMsg = document.createElement('p');
        errorMsg.setAttribute('id', 'em-' + e.id);
        errorMsg.setAttribute('class', 'inputerror');
        errorMsg.textContent = "↑ Incorrect format for " + e.id + " ↑";
        e.parentElement.parentElement.append(errorMsg);
    }
    formvalid();
}

//reset button handler
function resetform(e) {
    form.reset();
    inputs.forEach(element => {
        formValidation(element);
    });
}

//check if form inputs all valid
function formvalid() {
    valid = true
    inputs.forEach(element => {
        if (!element.validity.valid) {
            valid = false;
        }
    });
    if (valid) {
        addButton.disabled = false;
        addButton.style.backgroundColor = "";
    } else {
        addButton.disabled = true;
        addButton.style.backgroundColor = "grey";
    }
}
//______________________________________________

//init project array
const projects = []

//write and overwrite local storage
const writeLocal = () => {
    localStorage.setItem("data", JSON.stringify(projects))
    console.log("written", projects)
}

//add to local storage and keep previous
const appendLocal = () => {
    const local = JSON.parse(localStorage.getItem("data"))
    if (!local || local.length < 1) return writeLocal()

    //write only new projects
    const toWrite = local.filter(project => !projects.find(proj => proj.proj_id === project.proj_id))
    toWrite.push(...projects)

    console.log("appended", toWrite)
    localStorage.setItem("data", JSON.stringify(toWrite))
}

//clear local storage without clearing projects array
const clearLocal = () => {
    localStorage.clear()
    console.log("cleared")
}

//load projects from local storage and append to projects array
const loadLocal = () => {
    const local = JSON.parse(localStorage.getItem("data"))
    if (!local || local.length < 1) return updateTable(projects)

    //load only new projects
    const toLoad = local.filter(project => !projects.find(proj => proj.proj_id === project.proj_id))
    projects.push(...toLoad)

    //update table
    updateTable(projects)
    console.log("loaded", projects)
}

const updateTable = projects => {
    //get table
    const table = document.querySelector("tbody")

    //set table to have projects rows
    table.innerHTML = projects.map(project => {
        return `<tr>
                    <td>${project.proj_id}</td>
                    <td>${project.owner}</td>
                    <td>${project.title}</td>
                    <td>${project.category}</td>
                    <td>${project.hours}</td>
                    <td>${project.rate}</td>
                    <td>${project.status}</td>
                    <td>${project.description}</td>
                    <td><img class="edit" src="images/edit.png" alt="edit" /></td>
                    <td><img class="trash" src="images/trash.png" alt="trash" /></td>
                </tr>`
    }).join("")

    //"clone" element to remove event listener (separate forEach because of async)
    document.querySelectorAll("img.trash, img.edit").forEach(button => {
        button.outerHTML = button.outerHTML
    })

    document.querySelectorAll("img.edit").forEach(edit => {
        edit.addEventListener("click", e => {
            //get table row matching proj_id
            const row = e.target.parentElement.parentElement

            //clone inputs from form above
            let inputs = Array.from(document.querySelectorAll(".entry>input, .entry>textarea, select")).map(input => input.cloneNode(true))

            //if row contains inputs, remove them and set td values to inputs
            if (row.children[0].children[0]) {
                //get inputs from row
                inputs = Array.from(row.children).map(td => td.children[0])

                //get updated project from inputs
                const updatedProject = Object.fromEntries(Array.from(inputs).map(input => [input.id, input.value]))

                //set row (update row)
                row.innerHTML = Array.from(row.children).filter(child => child.children[0].tagName != "IMG").map(td => {
                    return `<td>${td.children[0].value}</td>`
                }).join("") + `<td><img class="edit" src="images/edit.png" alt="edit" /></td>` + `<td><img class="trash" src="images/trash.png" alt="trash" /></td>`

                //get index of original project
                const index = projects.findIndex(project => project.proj_id == row.children[0].textContent)

                //update project
                return projects[index] = updatedProject
            }

            //set td values to inputs
            Array.from(row.children).forEach((td, i) => {
                if (!inputs[i]) return

                inputs[i].className = "edit"
                inputs[i].value = td.textContent

                td.textContent = ""
                td.appendChild(inputs[i])
            })
        })
    })

    //add event listeners to remove the row from the table
    document.querySelectorAll("img.trash").forEach(trash => {
        trash.addEventListener("click", e => {
            //get table row matching proj_id
            const row = e.target.parentElement.parentElement

            //remove project from projects array matching proj_id
            const index = projects.findIndex(project => project.proj_id == row.children[0].textContent)
            projects.splice(index, 1)

            //remove row
            row.remove()
        })
    })
}

const getProjects = query => {
    //return all if query is empty
    if (!query) return projects

    //return projects from projects array that one of their properties contains query
    return projects.filter(p => Object.values(p).find(v => v.toString().toLowerCase().includes(query)))
}

const add = document.querySelector("#Add")

const write = document.querySelector("#write")
const append = document.querySelector("#append")
const clear = document.querySelector("#clear")
const load = document.querySelector("#load")

const query = document.querySelector("#query")

add.addEventListener("click", e => {
    //construct object from form inputs
    const project = Object.fromEntries(Array.from(inputs).map(input => [input.id, input.value]))

    //add to projects array
    projects.push(project)

    //update table
    updateTable(projects)
})

write.addEventListener("click", writeLocal)
append.addEventListener("click", appendLocal)
clear.addEventListener("click", clearLocal)
load.addEventListener("click", loadLocal)

query.addEventListener("input", () => {
    updateTable(getProjects(query.value))
})