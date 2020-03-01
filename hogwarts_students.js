"use strict";
document.addEventListener("DOMContentLoaded", start);

let allStudents = [];

let currentStudent = [];

let bloodArray = [];

let halfBlood = [];

let pureBlood = [];

let expelledStudents = [];

let selectedFilter;

const dest = document.querySelector("#liste");
const temp = document.querySelector("template");

const mySorting = document.querySelectorAll(".sort");

const Student = {
  firstName: "",
  middleName: undefined,
  nickName: undefined,
  lastName: "",
  gender: "",
  house: "",
  image: "",
  prefect: false,
  expelled: false,
  bloodStatus: ""
};

function start() {
  console.log("start");

  // EVENTLISTENER FOR FILTERING
  document.querySelectorAll(".filter").forEach(elm => {
    elm.addEventListener("click", handleFilter);
  });

  // EVENTLISTENER FOR SORTING
  mySorting.forEach(button => {
    button.addEventListener("click", sortButtonClick);
  });

  getJson();
}

async function getJson(myJson) {
  console.log("hent json");
  let jsonData = await fetch("https://petlatkea.dk/2020/hogwarts/students.json");
  myJson = await jsonData.json();

  let bloodData = await fetch("https://petlatkea.dk/2020/hogwarts/families.json");
  bloodArray = await bloodData.json();

  prepData(myJson, bloodArray);
}

function prepData(students) {
  console.log("prepData");

  // DATA CLEANING
  students.forEach(jsonObject => {
    let student = Object.create(Student);

    //FULL NAME
    let fullName = jsonObject.fullname.trim();
    fullName = fullName.toLowerCase();

    //FIRST NAME
    let firstChar = fullName.substring(0, 1);
    firstChar = firstChar.toUpperCase();

    student.firstName = fullName.substring(1, fullName.indexOf(" "));
    student.firstName = firstChar + student.firstName;

    // LAST NAME
    student.lastName = fullName.substring(fullName.lastIndexOf(" ") + 1, fullName.length + 1);
    let firstCharLastName = student.lastName.substring(0, 1);
    firstCharLastName = firstCharLastName.toUpperCase();
    student.lastName = firstCharLastName + fullName.substring(fullName.lastIndexOf(" ") + 2, fullName.length + 1);

    if (student.lastName.includes("-")) {
      let firstLastName = student.lastName.substring(0, student.lastName.indexOf("-"));
      let secondLastName = student.lastName.substring(student.lastName.indexOf("-") + 1);
      let firstCharSecondLastName = secondLastName.substring(0, 1);
      firstCharSecondLastName = firstCharSecondLastName.toUpperCase();
      secondLastName = firstCharSecondLastName + student.lastName.substring(student.lastName.indexOf("-") + 2);

      student.lastName = firstLastName + "-" + secondLastName;
    }

    //MIDDLE NAME
    student.middleName = fullName.substring(student.firstName.length + 1, fullName.lastIndexOf(" "));
    let firstCharMiddel = student.middleName.substring(0, 1);
    firstCharMiddel = firstCharMiddel.toUpperCase();

    if (student.middleName == " ") {
      student.middleName = undefined;
    } else if (student.middleName.includes('"')) {
      firstCharMiddel = student.middleName.substring(1, 2);
      firstCharMiddel = firstCharMiddel.toUpperCase();
      student.nickName = firstCharMiddel + fullName.substring(student.firstName.length + 3, fullName.lastIndexOf(" ") - 1);
      student.middleName = undefined;
    } else {
      student.middleName = firstCharMiddel + fullName.substring(student.firstName.length + 2, fullName.lastIndexOf(" "));
    }

    if (fullName.includes(" ") == false) {
      student.firstName = fullName.substring(1);
      student.firstName = firstChar + student.firstName;

      student.middleName = undefined;
      student.lastName = undefined;
    }

    // HOUSE
    let fullHouse = jsonObject.house.trim();
    fullHouse = fullHouse.toLowerCase();

    let firstCharHouse = fullHouse.substring(0, 1);
    firstCharHouse = firstCharHouse.toUpperCase();

    student.house = firstCharHouse + fullHouse.substring(1);

    //BLOODSTATUS
    halfBlood = bloodArray.half;
    pureBlood = bloodArray.pure;

    const halfBloodType = halfBlood.some(elm => {
      return elm === student.lastName;
    });

    const pureBloodType = pureBlood.some(elm => {
      return elm === student.lastName;
    });

    if (halfBloodType === true) {
      student.blood = "Halfblood";
    } else if (pureBloodType === true) {
      student.blood = "Pureblood";
    } else {
      student.blood = "Muggle";
    }

    // GENDER
    let genderDisplay = jsonObject.gender;
    let firstCharGender = genderDisplay.substring(0, 1);
    firstCharGender = firstCharGender.toUpperCase();
    student.gender = firstCharGender + genderDisplay.substring(1);

    // IMAGE
    let imageFirstChar = firstChar.toLowerCase();
    student.image = "images/" + student.lastName + "_" + imageFirstChar + ".png";

    allStudents.push(student);
  });

  displayList(allStudents);
}

function displayList(elm) {
  dest.innerHTML = "";

  elm.forEach(visStudents);

  // SEARCHBAR src: https://stackoverflow.com/questions/36897978/js-search-using-keyup-event-on-input-tag
  let search = document.getElementById("search");
  let el = document.querySelectorAll(".students");

  search.addEventListener("keyup", function() {
    el.forEach(student => {
      if (
        student
          .querySelector(".fullname")
          .textContent.toLowerCase()
          .includes(search.value.toLowerCase())
      ) {
        student.style.display = "block";
      } else {
        student.style.display = "none";
      }
    });
  });
}

function visStudents(student) {
  const clone = temp.cloneNode(true).content;

  let prefectElm = clone.querySelector("[data-field=prefect]");

  if (student.prefect) {
    prefectElm.textContent = "Prefect: " + "☑";
  } else {
    prefectElm.textContent = "Prefect: " + "☐";
  }

  if (student.lastName == undefined) {
    clone.querySelector(".fullname").textContent = student.firstName;
  } else {
    clone.querySelector(".fullname").textContent = student.firstName + " " + student.lastName;
  }
  clone.querySelector(".house").textContent = student.house;

  document.querySelector(".numerOfStudents").textContent = "Numer of students showing: " + allStudents.length;

  clone.querySelector("[data-field=prefect]").addEventListener("click", togglePrefect);
  function togglePrefect() {
    clickPrefects(student);
  }

  dest.appendChild(clone);

  dest.lastElementChild.querySelector(".fullname").addEventListener("click", () => {
    visSingle(student);
  });
}

function visSingle(student) {
  document.querySelector("#popup").style.display = "block";

  document.querySelector(".singleStudent").dataset.theme = student.house;
  // document.querySelector("#popup").dataset.theme = student.house;

  document.querySelector("#popup .luk").addEventListener("click", lukStudent);

  if (student.nickName != undefined) {
    document.querySelector(".singleStudent h2").textContent = student.firstName + " '" + student.nickName + "' " + student.lastName;
    // document.querySelector(".singleStudent p.nickname").textContent = "Nickname: " + student.nickName;
  } else if (student.middleName != undefined) {
    document.querySelector(".singleStudent h2").textContent = student.firstName + " " + student.middleName + " " + student.lastName;
  } else if (student.lastName == undefined) {
    document.querySelector(".singleStudent h2").textContent = student.firstName;
  } else {
    document.querySelector(".singleStudent h2").textContent = student.firstName + " " + student.lastName;
  }

  document.querySelector(".singleStudent .house").textContent = student.house;
  document.querySelector(".singleStudent .gender").textContent = student.gender;

  document.querySelector(".bloodType").textContent = student.blood;
  document.querySelector(".prefect").textContent = student.prefects;

  document.querySelector(".singleStudent .image").src = student.image;

  // EVENTLISTENER FOR EXPELLING
  document.querySelector(".expel").addEventListener("click", clickExpel);

  //EXPEL STUDENT
  function clickExpel() {
    console.log(student);

    document.querySelector(".expel").removeEventListener("click", clickExpel);
    // document.querySelector(".expel").removeEventListener("click");

    if (student.expelled == false) {
      student.expelled = true;
      student.prefect = false;
    }
    if (student.cannotBeExpelled == true) {
      student.expelled = false;
      alert("Nope");
    }

    currentStudent = allStudents.filter(student => {
      return student.expelled === false;
    });

    expelledStudents.push(student);

    const idx = allStudents.indexOf(student);
    allStudents.splice(idx, 1);

    displayList(currentStudent);
    lukStudent();
  }
  function lukStudent() {
    document.querySelector("#popup").style.display = "none";
    document.querySelector(".expel").removeEventListener("click", clickExpel);
  }
}

// FILTERING
function handleFilter() {
  console.log(this.dataset.filter);
  selectedFilter = this.dataset.filter;

  // Controls headding
  document.querySelector("h3").textContent = this.textContent;

  // Chosen button change color
  document.querySelectorAll(".filter").forEach(elm => {
    elm.classList.remove("valgt");
  });

  document.querySelectorAll(".sort").forEach(elm => {
    elm.classList.remove("valgt");
  });
  this.classList.add("valgt");

  filterArray(selectedFilter);
}

function filterArray(selectedFilter) {
  if (selectedFilter == "*") {
    currentStudent = allStudents;
  } else if (selectedFilter === "Expelled") {
    currentStudent = expelledStudents;
  } else {
    currentStudent = filterStudentsByHouse(selectedFilter);
  }
  displayList(currentStudent);

  document.querySelector(".numerOfStudents").textContent = "Numer of students showing: " + currentStudent.length;
}

function filterStudentsByHouse(house) {
  console.log(house);
  const result = allStudents.filter(filterFunction);

  function filterFunction(student) {
    if (student.house === house) {
      return true;
    } else {
      return false;
    }
  }
  return result;
}

// SORTING -> creds to Peter Ulf src: https://github.com/PeterUlf/animalbase/blob/master/animalbase.js#L60
function sortButtonClick() {
  console.log("sortButton");

  if (this.dataset.action === "sort") {
    clearAllSort();
    console.log("forskellig fra sorted", this.dataset.action);
    this.dataset.action = "sorted";
  } else {
    if (this.dataset.sortDirection === "asc") {
      this.dataset.sortDirection = "desc";
      console.log("sortdir desc", this.dataset.sortDirection);
    } else {
      this.dataset.sortDirection = "asc";
      console.log("sortdir asc", this.dataset.sortDirection);
    }
  }

  // Controls headding
  document.querySelector("h3").textContent = this.textContent;

  // Chosen button change color
  document.querySelectorAll(".sort").forEach(elm => {
    elm.classList.remove("valgt");
  });

  document.querySelectorAll(".filter").forEach(elm => {
    elm.classList.remove("valgt");
  });

  this.classList.add("valgt");

  mySort(this.dataset.sort, this.dataset.sortDirection);
}

function clearAllSort() {
  console.log("clearAllSort");
  mySorting.forEach(botton => {
    botton.dataset.action = "sort";
  });
}

function mySort(sortBy, sortDirection) {
  console.log(`mySort-, ${sortBy} sortDirection-  ${sortDirection}  `);
  let desc = 1;

  currentStudent = allStudents.filter(allStudents => true);

  if (sortDirection === "desc") {
    desc = -1;
  }

  currentStudent.sort(function(a, b) {
    var x = a[sortBy];
    var y = b[sortBy];
    if (x < y) {
      return -1 * desc;
    }
    if (x > y) {
      return 1 * desc;
    }
    return 0;
  });

  displayList(currentStudent);
}

// PREFECTS
function clickPrefects(clickedStudent) {
  console.log(clickedStudent);

  //creates an array for the prefects
  const prefects = allStudents.filter(elm => {
    return elm.prefect === true;
  });

  // Determine the house of student in prefects array
  const prefectsOfHouse = prefects.filter(elm => {
    return elm.house === clickedStudent.house;
  });

  // determine the clicked student by house and "allready prefect"
  if (clickedStudent.prefect === true) {
    console.log("remooove"); // doesent work for whatever reason
    clickedStudent.prefect = false;
  } else if (prefectsOfHouse) {
    clickedStudent.prefect = false;
  }

  if (prefectsOfHouse.length > 1) {
    clickedStudent.prefect = false;
  } else {
    clickedStudent.prefect = true;
  }

  // Stop the prefects array from going over 8
  if (prefects.length > 7) {
    clickedStudent.prefect = false;
  }

  displayList(allStudents);
}

// TODO: INQUISITIONAL SQUARD

// TODO: HACKING LIST
function hackTheSystem() {
  console.log("hacking the mainframe...");

  const myself = Object.create(Student);
  myself.firstName = "Victor";
  myself.lastName = "Øbro";
  myself.house = "Room of Requirement";
  myself.bloodStatus = "red i guess";
  myself.image = "images/oebro_v.png";
  myself.cannotBeExpelled = true;

  allStudents.push(myself);

  allStudents.forEach(student => {
    student.bloodStatus = Math.floor(Math.random() * 2);
  });

  displayList(allStudents);
}
