let mainSection = document.querySelector(".pokemons");
let smainSection = document.querySelector(".capPokemons");
const searchButton = document.getElementById("buttonSearch");
const inputButton = document.getElementById("inputSearch");
const ddm = document.getElementById("dropdown");
const modal = document.querySelector(".modal");
let tabAllPokemons = document.querySelector("#rOne");
let tabCapPokemons = document.querySelector("#rTwo");

let arrayPokemons = [];
let arrayCapturedPokemons = [];
let track = 0;
async function getData() {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=100`;
    let json;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}
async function getSingePokemon() {
    let data = await getData();
    let response;
    let json;
    for (i in data.results) {

        response = await fetch(data.results[i].url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        json = await response.json();
        arrayPokemons.push(json);
    }
}

// bez filtri ! 

async function waitForData(arrayPokemons) {
    const pokemonData = await Promise.all(arrayPokemons);
    return pokemonData;
}

window.onload = async function () {
    await getSingePokemon();
    loadPokemons();
    let localStPokemons = JSON.parse(localStorage.getItem("Captured Pokemons"));
    for (i in localStPokemons) {
        arrayCapturedPokemons.push(localStPokemons[i]);
    }
    if (arrayCapturedPokemons == null || arrayCapturedPokemons.length == 0) {
        smainSection.innerHTML = "<h2>Your Pokedex is waiting to be filled! Explore the world, catch new Pokemon, and uncover all their unique traits. Let's catch them all!</h2>"
    }
    loadCapturedPokemons();
}
async function loadCapturedPokemons() {
    track = 2;
    displayPokemos(arrayCapturedPokemons, track);
}
async function loadPokemons() {
    const pokemonData = await waitForData(arrayPokemons);
    //create div for each pokemon 
    track = 1;
    displayPokemos(pokemonData,track);
}
function displayPokemos(pokemonData,track) {
    for (pokemon in pokemonData) {
        const formattedNumber = pokemonData[pokemon].id > 9 ? `#0${pokemonData[pokemon].id}` : `#00${pokemonData[pokemon].id}`;
        let img = pokemonData[pokemon].sprites.other['official-artwork'].front_default;
        let pokeDiv = document.createElement('div');
        let checkbox = createCheckbox(); 
        checkbox.id = `checkbox${pokemonData[pokemon].id}`;
        pokeDiv.classList.add('pokemonDiv', `${pokemonData[pokemon].types[0].type.name}`,);
        pokeDiv.innerHTML +=
            `<img src=${img} class="pokemonImg"/>
              <p class="title">${(pokemonData[pokemon].name).charAt(0).toUpperCase() + (pokemonData[pokemon].name).slice(1)}</p>
              <p class="number">${formattedNumber}</p>`;
        pokeDiv.appendChild(getTypes(pokemonData[pokemon].types));
        pokeDiv.appendChild(checkbox);
        pokeDiv.id = pokemonData[pokemon].id;
        if (track == 1) {
            const isCaptured = arrayCapturedPokemons.map(pokemon => pokemon.id);
            if (isCaptured.includes(pokemonData[pokemon].id)) {
                checkbox.checked = true;
            }
            mainSection.appendChild(pokeDiv);
        }
        else if(track == 2){
            smainSection.appendChild(pokeDiv);
            checkbox.checked = true;
        }
        getColorOfDiv(pokemonData[pokemon].types[0].type.name, pokeDiv);
        addClickEventDiv(pokeDiv, pokemonData);
        addChangeCheckboxEvent(checkbox, pokemonData);
    }

}
function createCheckbox() {
    let checkbox = document.createElement('input');
    checkbox.setAttribute("type", "checkbox");
    checkbox.classList.add("checkbox");
    return checkbox;
}
function addChangeCheckboxEvent(checkbox,pokemonData) {
    checkbox.addEventListener("change", function (e) {
        id = e.target.id.slice(8);
        if (this.checked) {
            for (i in pokemonData) {
                if (pokemonData[i].id == id) {
                    arrayCapturedPokemons.push(pokemonData[i]);
                    smainSection.innerHTML = "";
                    displayPokemos(arrayCapturedPokemons, 2);
                    localStorage.setItem("Captured Pokemons", JSON.stringify(arrayCapturedPokemons));
                    return;
                }
            }
        }
        else {
            const index = arrayCapturedPokemons.findIndex(pokemon => pokemon.id == id);
            if (index > -1) {
                arrayCapturedPokemons.splice(index, 1);
                localStorage.removeItem("Captured Pokemons");
                localStorage.setItem("Captured Pokemons", JSON.stringify(arrayCapturedPokemons));
                smainSection.innerHTML = "";
                mainSection.innerHTML = "";
                displayPokemos(arrayPokemons, 1);
                displayPokemos(arrayCapturedPokemons, 2);
                
            }
        }
        
    })
}
function addClickEventDiv(div,pokemonData) {
    div.addEventListener(("click"), function (e) {
        if (e.target.classList.contains("checkbox")) {
            return;
        }

        for (pokemon in pokemonData) {
            if (e.target.id == pokemonData[pokemon].id) {
                openPokemonDetails(pokemonData[pokemon]);
            }
        }
    })
}
function getTypes(pokemonTypes) {
    let div = document.createElement('div');

    // loop througnh types 
    for (types in pokemonTypes) {
        let p = document.createElement('p');
        p.innerHTML = getTypeIcon(pokemonTypes[types].type.name) + (pokemonTypes[types].type.name).charAt(0).toUpperCase() + (pokemonTypes[types].type.name).slice(1);
        p.classList.add(`${pokemonTypes[types].type.name}type`);
        p.style.display = "inline";
        div.appendChild(p);
    }
    div.classList.add('typesDiv');
    return div;
}

function getTypeIcon(name) {
    let icon;
    switch (name) {
        case "fire":
            icon = "image/fire.png";
            break;
        case "grass":
            icon = "image/leaf.png";
            break;
        case "water":
            icon = "image/drop-silhouette.png";
            break;
        case "poison":
            icon = "image/poison.jpg";
            break;
        case "flying":
            icon = "image/flying.png";
            break;
        case "bug":
            icon = "image/bug.jpg";
            break;
        default:
            icon = "image/circle.png";
            break;
    }
    return `<img src=${icon} height="10" width="10" class="iconType"/>`
}

searchButton.addEventListener("click", async function () {
    let pokemonData;
    let array = [];
    if (tabAllPokemons.checked) {
        pokemonData = await waitForData(arrayPokemons);
        array = searchFunction(pokemonData);
        if (array == null || array.length == 0) {
            mainSection.innerHTML = "";
            mainSection.innerHTML += `<h2>The Pokemon name you entered doesn't match any known Pokemon. Please try a different name, such as 'Pikachu' or 'Bulbasaur'.</h2>`;
        }
        else {
            mainSection.innerHTML = "";
            displayPokemos(array,1);
        }
        
    }
    else if (tabCapPokemons.checked) {
        pokemonData = arrayCapturedPokemons;
        array = searchFunction(pokemonData);
        if (array == null || array.length == 0) {
            mainSection.innerHTML += `<h2>The Pokemon name you entered doesn't match any known Pokemon. Please try a different name, such as 'Pikachu' or 'Bulbasaur'.</h2>`;
        }
        else {
            smainSection.innerHTML = "";
            smainSection.innerHTML = "";
            displayPokemos(array,2);
        }
        
    }
    
})
function searchFunction(pokemonData) {
    let array = [];
    for (pokemon in pokemonData) {
        let match = pokemonData[pokemon].types.find((el) => el.type.name == inputButton.value);
        if (inputButton.value == pokemonData[pokemon].name
            || inputButton.value == pokemonData[pokemon].id || match) {
            array.push(pokemonData[pokemon]);
        }
    }
    return array;
}
inputButton.addEventListener("change", function () {
    if (inputButton.value == null || inputButton.value.length == 0) {
        if (tabAllPokemons.checked) {
            mainSection.innerHTML = "";
            loadPokemons();
        }
        else if (tabCapPokemons.checked) {
            smainSection.innerHTML = "";
            loadCapturedPokemons();
        }
    }
})

ddm.addEventListener("change", async function () {
    let pokemonData;
    let data;
    if (tabAllPokemons.checked) {
        pokemonData = await waitForData(arrayPokemons);
        data = sortPokemons(ddm.value, pokemonData);
        mainSection.innerHTML = "";
        displayPokemos(data,1);
    }
    else if (tabCapPokemons.checked) {
        pokemonData = arrayCapturedPokemons;
        data = sortPokemons(ddm.value, pokemonData);
        smainSection.innerHTML = "";
        displayPokemos(data,2);
    } 
})
function sortPokemons(value, pokemonData) {
    let sorted;
    switch (value) {
        case "highest":
            sorted = pokemonData.sort((a, b) => b.id - a.id);
            break;
        case "ascending":
            sorted = pokemonData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "descending":
            sorted = pokemonData.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            sorted = pokemonData.sort((a, b) => a.id - b.id);
            break;
    }
    return sorted;
}
function openPokemonDetails(data) {
    modal.style.display = "block";
    modal.innerHTML = "";
    let pokeModalHeader = document.createElement('div');
    let pokeModalHeaderContent = document.createElement('div');
    let pokeModalData = document.createElement('div');

    let img = data.sprites.other['official-artwork'].front_default;
    const formattedNumber = data.id > 9 ? `#0${data.id}` : `#00${data.id}`;

    pokeModalHeader.classList.add('modalHeader', `${data.types[0].type.name}`);
    pokeModalHeaderContent.classList.add('headerContent');
    pokeModalHeader.innerHTML += `<img class="xImage" src="image/x-button.png"/>`

    pokeModalHeaderContent.innerHTML += `
                    <img class="imgModal" src="${img}"/>
                    <p class="numberModal">${formattedNumber}</p>
                    <p class="titleModal">${(data.name).charAt(0).toUpperCase() + (data.name).slice(1)}</p>
                    `
    pokeModalData.innerHTML += `
                    <p class="details">Details</p>
                    <hr>
                    <table>
                    <tr>
                        <td class="names">Abilities</td>
                        <td class="values">${data.abilities[0].ability.name},${data.abilities[1].ability.name}</td>
                    </tr>
                    <tr>
                        <td class="names">Height</td>
                        <td class="values">${data.height}</td>
                    </tr>
                    <tr>
                        <td class="names">Weight</td>
                        <td class="values">${data.weight}</td>
                    </tr>
                    <tr>
                        <td class="names">HP</td>
                        <td class="values">${data.stats[0].base_stat}</td>
                    </tr>
                    <tr>
                        <td class="names">Attack</td>
                        <td class="values">${data.stats[1].base_stat}</td>
                    </tr>
                    <tr>
                        <td class="names">Defense</td>
                        <td class="values">${data.stats[2].base_stat}</td>
                    </tr>
                    <tr>
                        <td class="names">Speed</td>
                        <td class="values">${data.stats[5].base_stat}</td>
                    </tr>
                    </table>
    `
    pokeModalHeaderContent.appendChild(getTypes(data.types));
    pokeModalHeader.appendChild(pokeModalHeaderContent);
    modal.appendChild(pokeModalHeader);
    pokeModalHeader.after(pokeModalData);
    getColorOfDiv(data.types[0].type.name, pokeModalHeader);
    const backButton = document.querySelector(".xImage");
    backButton.addEventListener("click", function () {
        modal.style.display = "none";
    })
}
function getColorOfDiv(color, div) {

    switch (color) {
        case "grass":
            div.style.backgroundColor = "#00cc00";
            break;
        case "fire":
            div.style.backgroundColor = "#ff9999";
            break;
        case "water":
            div.style.backgroundColor = "#00ace6";
            break;
        case "bug":
            div.style.backgroundColor = "#99cc00";
            break;
        default:
            div.style.backgroundColor = "#cccccc";
            break;
    }
}

