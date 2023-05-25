const endpoint = "https://semester-project-mc-default-rtdb.firebaseio.com/";

// JavaScript code (index.js)
const nameFilterInput = document.getElementById("nameFilter");
const ageFilterInput = document.getElementById("ageFilter");
const positionFilterInput = document.getElementById("positionFilter");
const idFilterInput = document.getElementById("idFilter");
const hasPaidDuesFilterInput = document.getElementById("hasPaidDuesFilter");

const memberTable = document.getElementById("memberTable");
window.addEventListener("DOMContentLoaded", async () => {
  const memberId = getMemberIdFromUrl();
  console.log(memberId);
  const member = await getMemberById(memberId);
  console.log(member);
  await displayMemberDetails(memberId);
  if (window.location.pathname == "/memberPage.html") {
    console.log(member);
    populateFields(member);
    const updateButtonForm = document.getElementById("updateButtonForm");
    updateButtonForm.addEventListener("click", toggleUpdateMemberSection);

    const updateButton = document.getElementById("updateUserButton");
    updateButton.addEventListener("click", updateCurrentMember);

    const backButton = document.getElementById("backButton");
    backButton.addEventListener("click", navigateToHomePage);
  }
});
if (window.location.pathname == "/topListPage.html") {
  displayTopMembersByTime();
  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", navigateToHomePage);
}

if (window.location.pathname == "/index.html") {
  // Add event listeners for filter inputs and the "Add User" button
  nameFilterInput.addEventListener("input", updateDisplay);
  ageFilterInput.addEventListener("input", updateDisplay);
  positionFilterInput.addEventListener("input", updateDisplay);
  hasPaidDuesFilterInput.addEventListener("input", updateDisplay);
  window.addEventListener("load", displayMemberPayments);

  const topListButton = document.getElementById("toTopListButton");
  topListButton.addEventListener("click", navigateToTopListPage);
}

let membersData = [];

// Fetch members data from the server
async function fetchMembersData() {
  try {
    const response = await fetch(`${endpoint}/Members.json`);

    if (response.ok) {
      const data = await response.json();
      membersData = prepareData(data);
      await displayMembers(membersData); // Update the table with the new member data
      console.log(membersData);
    } else {
      throw new Error("Failed to fetch member data.");
    }
  } catch (error) {
    console.log(error);
  }
}

// Prepare the members data for display
function prepareData(data) {
  const members = Object.values(data);
  return members.filter((member) => member !== null);
}

// Create a table row for a member
function createMemberRow(member) {
  const row = document.createElement("tr");
  row.classList.add("tableItem");

  // Attach a click event listener to the row
  row.addEventListener("click", redirectToUser);

  const nameCell = document.createElement("td");
  const fullName = member ? `${member.firstName} ${member.lastName}` : "N/A";
  nameCell.textContent = fullName;
  row.appendChild(nameCell);

  const ageCell = document.createElement("td");
  const age = member ? member.age : "N/A";
  ageCell.textContent = age;
  row.appendChild(ageCell);

  const positionCell = document.createElement("td");
  const position = member ? member.position : "N/A";
  positionCell.textContent = position;
  row.appendChild(positionCell);

  const idCell = document.createElement("td");
  const id = member ? member.id : "N/A";
  idCell.textContent = id;
  row.appendChild(idCell);

  // Create a delete button
  const deleteButtonCell = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";

  // Attach a click event listener to the delete button
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the row click event from triggering
    deleteMember(member.id); // Call the deleteMember function
  });

  deleteButtonCell.appendChild(deleteButton);
  row.appendChild(deleteButtonCell);

  row.dataset.memberId = id;
  return row;
}

// Display the members in the table
async function displayMembers(members) {
  // Clear existing table rows
  if (memberTable) {
    memberTable.innerHTML = "";

    // Create table rows for each member
    members.forEach((member) => {
      const row = createMemberRow(member);
      memberTable.appendChild(row); // Use memberTable instead of table
    });
  }
}

// Redirect to member page
function redirectToUser() {
  const memberId = this.dataset.memberId; // Retrieve the member ID from the data attribute
  window.location.href = `memberPage.html?id=${memberId}`; // Redirect to member.html with the member ID as a query parameter
}

// Create
let showAddUserSection = false;

// Toggle the display of the add user section
function toggleAddUserSection() {
  const addUserContainer = document.getElementById("addUserContainer");
  addUserContainer.style.display = showAddUserSection ? "none" : "block";
  showAddUserSection = !showAddUserSection;
  resetNewUser();
}

// Update
let showUpdateMemberSection = false;

// Toggle the display of the update member section
function toggleUpdateMemberSection() {
  const updateMemberContainer = document.getElementById("updateUserSection");
  updateMemberContainer.style.display = showUpdateMemberSection
    ? "none"
    : "block";
  showUpdateMemberSection = !showUpdateMemberSection;
}

// Reset the new user form fields and error message
function resetNewUser() {
  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const ageInput = document.getElementById("ageInput");
  const errorMessageLabel = document.getElementById("errorMessage");

  firstNameInput.value = "";
  lastNameInput.value = "";
  ageInput.value = "";
  errorMessageLabel.textContent = "";
}

// Add a member to the server
// Add a member to the server
async function addMember(member) {
  try {
    // Determine the position based on the member's age
    const position = member.age >= 18 ? "Senior" : "Junior";
    member.position = position; // Update the position field in the member object

    const response = await fetch(`${endpoint}/Members.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    });

    if (response.ok) {
      // Member added successfully
      membersData.push(member); // Update the membersData array with the new member
      await displayMembers(membersData);
      filterMembers(); // Refresh the filtered members
    } else {
      throw new Error("Failed to add member.");
    }
  } catch (error) {
    console.log(error);
  }
}

function addNewUser() {
  // Validation and logic for adding a new user
  // Access the new user data from the form fields and perform any necessary validations

  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const ageInput = document.getElementById("ageInput");
  const idInput = document.getElementById("idInput");
  const errorMessageLabel = document.getElementById("errorMessage");

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const age = ageInput.value.trim();
  const id = parseInt(idInput.value.trim(), 10);

  // Example validation: Ensure all required fields are filled
  if (!firstName || !lastName || !age || !id) {
    errorMessageLabel.textContent = "Please fill in all fields.";
    return;
  }

  // Example logic: Call the API or perform any necessary operations to add the new user
  // Assuming you have a function `addUser` to make the API request
  const newMember = {
    firstName,
    lastName,
    age,
    id,
  };

  addMember(newMember)
    .then(() => {
      // User added successfully
      // Clear the form and hide the add user section
      resetNewUser();
      toggleAddUserSection();
    })
    .catch((error) => {
      // Handle any errors
      errorMessageLabel.textContent = "Failed to add user.";
      console.log(error);
    });
}

// DELETE
async function deleteMember(memberId) {
  try {
    const memberIndex = membersData.findIndex(
      (member) => member.id === memberId
    );

    if (memberIndex !== -1) {
      const response = await fetch(`${endpoint}/Members.json`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();

        // Get the Firebase key (unique key) of the member to be deleted
        const firebaseKey = Object.keys(data).find(
          (key) => data[key].id === memberId
        );

        if (firebaseKey) {
          const deleteResponse = await fetch(
            `${endpoint}/Members/${firebaseKey}.json`,
            {
              method: "DELETE",
            }
          );

          if (deleteResponse.ok) {
            // Remove the member from the local membersData array
            membersData.splice(memberIndex, 1);

            // Update the table with the modified membersData
            await displayMembers(membersData);
            filterMembers();

            console.log(membersData);
            console.log("Member deleted successfully");
          } else {
            throw new Error("Failed to delete member.");
          }
        } else {
          console.log("Member not found in database");
        }
      } else {
        throw new Error("Failed to fetch member data.");
      }
    } else {
      console.log("Member not found in local data");
    }
  } catch (error) {
    console.log(error);
  }
}

// Filter members based on the filter inputs
function filterMembers() {
  const nameFilter = nameFilterInput.value.trim().toLowerCase();
  const ageFilter = ageFilterInput.value.trim().toLowerCase();
  const positionFilter = positionFilterInput.value.trim().toLowerCase();
  const hasPaidDuesFilter = hasPaidDuesFilterInput.value.trim().toLowerCase();

  const filteredMembers = membersData.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const age = member.age ? member.age.toString() : "";
    const position = member.position ? member.position.toLowerCase() : "";
    const hasPaidDues = member.hasPaidDues ? "true" : "false"; // Convert boolean to string for comparison

    return (
      fullName.includes(nameFilter) &&
      age.includes(ageFilter) &&
      position.includes(positionFilter) &&
      hasPaidDues.includes(hasPaidDuesFilter)
    );
  });

  return filteredMembers;
}

// Update the display with filtered members
function updateDisplay() {
  const filteredMembers = filterMembers();
  displayMembers(filteredMembers);
}

// Display member details on the page

async function displayMemberDetails(memberId) {
  try {
    console.log("this is the member Id " + memberId);
    const member = await getMemberById(memberId);
    console.log("member " + member);
    if (member) {
      // Get the HTML elements to display member details
      const idElement = document.getElementById("memberId");
      const nameElement = document.getElementById("memberName");
      const ageElement = document.getElementById("memberAge");
      const positionElement = document.getElementById("memberPosition");

      // Set the text content of the HTML elements with member details
      idElement.textContent = member.id;
      nameElement.textContent = `${member.firstName} ${member.lastName}`;
      ageElement.textContent = member.age;
      positionElement.textContent = member.position;
    } else {
      console.log(`Member with ID ${memberId} not found.`);
    }
  } catch (error) {
    console.error(error);
  }
}

function getMemberIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

async function getMemberById(memberId) {
  try {
    const response = await fetch(`${endpoint}/Members.json`);
    console.log("memberid in this function " + memberId);
    if (response.ok) {
      const data = await response.json();
      membersData = prepareData(data);
      console.log("members Data " + membersData);
      const member = membersData.find(
        (member) => member.id === parseInt(memberId, 10)
      );
      console.log("getmemberByID method member " + member);
      return member || null;
    } else {
      throw new Error("Failed to fetch member data.");
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

function populateFields(member) {
  console.log("PLEASE ", member);
  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const ageInput = document.getElementById("ageInput");
  const positionInput = document.getElementById("positionInput");
  const disciplineInput = document.getElementById("disciplineInput");
  const paymentInput = document.getElementById("paymentInput");
  const hasPaidDuesInput = document.getElementById("hasPaidDuesInput");
  const membershipInput = document.getElementById("membershipInput");

  const swimmingTypeInput = document.getElementById("swimmingTypeInput");
  const bestResultInput = document.getElementById("bestResultInput");
  const coachNameInput = document.getElementById("coachNameInput");
  const conventionInput = document.getElementById("conventionInput");
  const dateInput = document.getElementById("dateInput");
  const latestResultInput = document.getElementById("latestResultInput");
  const placementInput = document.getElementById("placementInput");

  // Populate the form fields with the member's details
  firstNameInput.value = member.firstName;
  lastNameInput.value = member.lastName;
  ageInput.value = member.age;
  positionInput.value = member.position;
  disciplineInput.value = member.discipline;
  paymentInput.value = member.payment;
  hasPaidDuesInput.value = member.hasPaidDues;
  membershipInput.value = member.membership;
  swimmingTypeInput.value = member.swimmingType;
  bestResultInput.value = member.bestResult;
  coachNameInput.value = member.coachName;
  conventionInput.value = member.convention;
  dateInput.value = member.date;
  latestResultInput.value = member.latestResult;
  placementInput.value = member.placement;
}

async function updateCurrentMember() {
  // Access the updated member data from the form fields and perform any necessary validations
  const memberId = getMemberIdFromUrl();
  const member = await getMemberById(memberId);

  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const ageInput = document.getElementById("ageInput");
  const positionInput = document.getElementById("positionInput");
  const disciplineInput = document.getElementById("disciplineInput");
  const paymentInput = document.getElementById("paymentInput");
  const hasPaidDuesInput = document.getElementById("hasPaidDuesInput");
  const membershipInput = document.getElementById("membershipInput");

  const swimmingTypeInput = document.getElementById("swimmingTypeInput");
  const bestResultInput = document.getElementById("bestResultInput");
  const coachNameInput = document.getElementById("coachNameInput");
  const conventionInput = document.getElementById("conventionInput");
  const dateInput = document.getElementById("dateInput");
  const latestResultInput = document.getElementById("latestResultInput");
  const placementInput = document.getElementById("placementInput");

  const errorMessageLabel = document.getElementById("errorMessage");

  const firstName = firstNameInput.value.trim() || member.firstName;
  const lastName = lastNameInput.value.trim() || member.lastName;
  const age = ageInput.value.trim() || member.age;
  const position = positionInput.value.trim() || member.position;
  const discipline = disciplineInput.value.trim() || member.discipline;
  const payment = paymentInput.value.trim() || member.payment;
  const hasPaidDues = hasPaidDuesInput.value.trim() || member.hasPaidDues;
  const membership = membershipInput.value.trim() || member.membership;

  const swimmingType = swimmingTypeInput.value.trim() || member.swimmingType;
  const bestResult = bestResultInput.value.trim() || member.bestResult;
  const coachName = coachNameInput.value.trim() || member.coachName;
  const convention = conventionInput.value.trim() || member.convention;
  const date = dateInput.value.trim() || member.date;
  const latestResult = latestResultInput.value.trim() || member.latestResult;
  const placement = placementInput.value.trim() || member.placement;

  // Error Handeling
  // if (!firstName || !lastName || !age || !position) {
  //   errorMessageLabel.textContent = "Please fill in all fields.";
  //   return;
  // }

  // Example logic: Call the API or perform any necessary operations to update the member
  // Assuming you have a function `updateMember` to make the API request
  const updatedMember = {
    ...member, // Preserve all original member properties
    firstName,
    lastName,
    age,
    position,
    discipline,
    payment,
    hasPaidDues,
    membership,
    swimmingType,
    bestResult,
    coachName,
    convention,
    date,
    latestResult,
    placement,
  };

  try {
    await updateMember(memberId, updatedMember);
    await displayMemberDetails(memberId);
    // Member updated successfully
    // Retrieve the updated member from the server
    const member = await getMemberById(memberId);
    if (member) {
      // Call the function to populate the form fields with the updated member details
      populateFields(member);
      toggleUpdateMemberSection();
      console.log("Member updated successfully");
    } else {
      console.log("Failed to retrieve the updated member");
    }
  } catch (error) {
    // Handle any errors
    errorMessageLabel.textContent = "Failed to update member.";
    console.log(error);
  }
}

async function updateMember(memberId, member) {
  try {
    const memberIndex = membersData.findIndex(
      (mem) => mem.id === parseInt(memberId)
    );

    if (memberIndex !== -1) {
      const response = await fetch(`${endpoint}/Members.json`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();

        const firebaseKey = Object.keys(data).find(
          (key) => data[key].id === parseInt(memberId)
        );

        if (firebaseKey) {
          const originalMember = membersData[memberIndex];

          const updatedMember = {
            ...originalMember,
            ...member,
            id: originalMember.id, // Preserve the original id
            firstName:
              member.firstName !== undefined
                ? member.firstName
                : originalMember.firstName,
            lastName:
              member.lastName !== undefined
                ? member.lastName
                : originalMember.lastName,
            age: member.age !== undefined ? member.age : originalMember.age,
            discipline:
              member.discipline !== undefined
                ? member.discipline
                : originalMember.discipline,
            position:
              member.position !== undefined
                ? member.position
                : originalMember.position,
            payment:
              member.payment !== undefined
                ? member.payment
                : originalMember.payment,
            hasPaidDues:
              member.hasPaidDues !== undefined
                ? member.hasPaidDues
                : originalMember.hasPaidDues,
            membership:
              member.membership !== undefined
                ? member.membership
                : originalMember.membership,
            swimmingType:
              member.swimmingType !== undefined
                ? member.swimmingType
                : originalMember.swimmingType,
            bestResult:
              member.bestResult !== undefined
                ? member.bestResult
                : originalMember.bestResult,
            coachName:
              member.coachName !== undefined
                ? member.coachName
                : originalMember.coachName,
            convention:
              member.convention !== undefined
                ? member.convention
                : originalMember.convention,
            date: member.date !== undefined ? member.date : originalMember.date,
            latestResult:
              member.latestResult !== undefined
                ? member.latestResult
                : originalMember.latestResult,
            placement:
              member.placement !== undefined
                ? member.placement
                : originalMember.placement,
          };

          for (const key in updatedMember) {
            if (updatedMember[key] === undefined) {
              delete updatedMember[key];
            }
          }

          const updateResponse = await fetch(
            `${endpoint}/Members/${firebaseKey}.json`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedMember),
            }
          );

          if (updateResponse.ok) {
            membersData[memberIndex] = updatedMember;
            await displayMembers(membersData);

            console.log("Member updated successfully");
          } else {
            throw new Error("Failed to update member.");
          }
        } else {
          console.log("Member not found in database");
        }
      } else {
        throw new Error("Failed to fetch member data.");
      }
    } else {
      console.log("Member not found in local data");
    }
  } catch (error) {
    console.log(error);
  }
}

async function displayTopMembersByTime() {
  // Filter members based on position (Junior and Senior) and swimmingType (Competitive)
  await fetchMembersData();

  const juniorMembers = membersData.filter(
    (member) =>
      member.position === "Junior" && member.swimmingType === "Competitive"
  );
  const seniorMembers = membersData.filter(
    (member) =>
      member.position === "Senior" && member.swimmingType === "Competitive"
  );

  // Create an object to store top members for each discipline
  const topMembersByDiscipline = {};

  // Helper function to compare members by bestResult
  const compareByBestResult = (a, b) => a.bestResult - b.bestResult;

  // Iterate over the members to group them by discipline
  [...juniorMembers, ...seniorMembers].forEach((member) => {
    const { discipline } = member;

    // Skip members without a discipline
    if (!discipline) return;

    if (!topMembersByDiscipline[discipline]) {
      // Initialize the discipline entry if it doesn't exist
      topMembersByDiscipline[discipline] = {
        juniorMembers: [],
        seniorMembers: [],
      };
    }

    // Add the member to the respective category (Junior or Senior)
    const category =
      member.position === "Junior" ? "juniorMembers" : "seniorMembers";
    topMembersByDiscipline[discipline][category].push(member);
  });

  // Get the container elements in which to display the lists
  const topJuniorMembersContainer = document.getElementById("topJuniorMembers");
  const topSeniorMembersContainer = document.getElementById("topSeniorMembers");

  // Clear the container elements before adding new content
  topJuniorMembersContainer.innerHTML = "";
  topSeniorMembersContainer.innerHTML = "";

  // Generate the HTML content for each list
  for (const discipline in topMembersByDiscipline) {
    const { juniorMembers, seniorMembers } = topMembersByDiscipline[discipline];

    // Sort and get the top 5 members for each discipline
    juniorMembers.sort(compareByBestResult);
    seniorMembers.sort(compareByBestResult);

    // Generate the HTML content for the top junior members
    const topJuniorMembersHTML = `
      <h2>Top Junior Members for ${discipline}</h2>
      <ul>
        ${juniorMembers
          .slice(0, 5) // Take only the top 5 members
          .map(
            (member) =>
              `<li>${member.firstName} ${member.lastName} - ${member.bestResult}</li>`
          )
          .join("")}
      </ul>
    `;

    // Generate the HTML content for the top senior members
    const topSeniorMembersHTML = `
      <h2>Top Senior Members for ${discipline}</h2>
      <ul>
        ${seniorMembers
          .slice(0, 5) // Take only the top 5 members
          .map(
            (member) =>
              `<li>${member.firstName} ${member.lastName} - ${member.bestResult}</li>`
          )
          .join("")}
      </ul>
    `;

    // Append the HTML content to the respective container elements
    topJuniorMembersContainer.insertAdjacentHTML(
      "beforeend",
      topJuniorMembersHTML
    );
    topSeniorMembersContainer.insertAdjacentHTML(
      "beforeend",
      topSeniorMembersHTML
    );
  }
}

async function calculateMemberPayment() {
  await fetchMembersData(); // Fetch and populate membersData

  let totalPayment = 0;
  console.log(membersData);
  membersData.forEach((member) => {
    // Check if the member has a non-zero payment value, hasPaidDues is true, and membership is true
    if (member.payment && member.payment !== "0" && member.hasPaidDues) {
      // Parse the payment value as a number
      const payment = parseInt(member.payment);
      console.log(member.payment, payment); // Add this line
      // Check if the parsed payment is a valid number
      if (!isNaN(payment)) {
        // Add the payment to the totalPayment
        totalPayment += payment;
      } else {
        console.log(
          `Invalid payment value for member: ${member.firstName} ${member.lastName}`
        );
      }
    }
  });

  console.log(totalPayment);
  return totalPayment;
}

// Call calculateMemberPayment to check the values

function displayMemberPayments() {
  calculateMemberPayment()
    .then((totalPayment) => {
      const totalPaymentElement = document.getElementById("totalPayment");
      totalPaymentElement.textContent = `Total Revenue: ${totalPayment} DKK`;
    })
    .catch((error) => {
      console.error(error);
      // Handle any errors that occur during the process
    });
}

function navigateToHomePage() {
  window.location.href = "index.html"; // Replace "index.html" with the actual URL of your home page
}

function navigateToTopListPage() {
  window.location.href = "topListPage.html";
}

// Call the fetchMembersData function to retrieve the data and populate the table
fetchMembersData();
