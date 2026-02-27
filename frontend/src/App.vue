<script setup>
import { ref, computed } from 'vue';

// Define mock roles and their hourly rates
const roles = ref([
  { name: '總監', rate: 300 },
  { name: '資深工程師', rate: 200 },
  { name: '工程師', rate: 150 },
  { name: '初階員工', rate: 100 },
]);

// Reactive object to store the count of each selected role
const selectedParticipants = ref(
  roles.value.reduce((acc, role) => {
    acc[role.name] = 0; // Initialize all counts to 0
    return acc;
  }, {})
);

// Estimated meeting duration in hours for calculation
const meetingDurationHours = ref(1); // Default to 1 hour

// Computed property to calculate the total estimated cost
const estimatedCost = computed(() => {
  let totalCost = 0;
  for (const roleName in selectedParticipants.value) {
    const role = roles.value.find(r => r.name === roleName);
    if (role) {
      totalCost += selectedParticipants.value[roleName] * role.rate * meetingDurationHours.value;
    }
  }
  return totalCost;
});

const resetParticipants = () => {
  for (const roleName in selectedParticipants.value) {
    selectedParticipants.value[roleName] = 0;
  }
  meetingDurationHours.value = 1;
};
</script>

<template>
  <div class="popup-container">
    <h1 class="popup-title">MeetLogic AI - 會議預算守門員</h1>

    <div class="input-section">
      <label for="meeting-duration" class="input-label">會議時長 (小時):</label>
      <input
        id="meeting-duration"
        type="number"
        v-model.number="meetingDurationHours"
        min="0.25"
        step="0.25"
        class="duration-input"
      />
    </div>

    <div class="roles-selection">
      <h2 class="section-title">與會者角色與數量</h2>
      <div v-for="role in roles" :key="role.name" class="role-item">
        <label class="role-label">{{ role.name }} </label>
        <input
          type="number"
          v-model.number="selectedParticipants[role.name]"
          min="0"
          class="role-input"
        />
      </div>
    </div>

    <div class="cost-summary">
      <h2 class="section-title">預估會議成本</h2>
      <p class="estimated-cost">總成本: ${{ estimatedCost.toFixed(2) }}</p>
    </div>

    <button @click="resetParticipants" class="reset-button">重設</button>
  </div>
</template>

<style scoped>
.popup-container {
  font-family: 'Arial', sans-serif;
  padding: 20px;
  width: 300px;
  background-color: #f4f7f6; /* Light background */
  color: #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.popup-title {
  color: #007bff; /* Primary blue */
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5em;
  font-weight: bold;
}

.section-title {
  color: #555;
  font-size: 1.1em;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.input-section, .roles-selection, .cost-summary {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.duration-input, .role-input {
  width: calc(100% - 20px);
  padding: 8px 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-label {
  flex-grow: 1;
  margin-right: 10px;
}

.role-input {
  width: 60px; /* Smaller width for number input */
  text-align: center;
}

.estimated-cost {
  font-size: 1.4em;
  font-weight: bold;
  color: #28a745; /* Success green */
  text-align: center;
}

.reset-button {
  background-color: #6c757d; /* Muted grey */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease-in-out;
  align-self: center;
  width: fit-content;
}

.reset-button:hover {
  background-color: #5a6268;
}
</style>
