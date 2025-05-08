
document.addEventListener('DOMContentLoaded', function () {
    const STATE = {
      selectedCharacter: null,
      currentScenario: null,
      securityLevel: 3,
      userChoices: {
        character: null,
        decisions: []
      }
    };
  

    const ELEMENTS = {
      loadingOverlay: document.getElementById('loadingOverlay'),
      mainContent: document.getElementById('mainContent'),
      portalTransition: document.getElementById('portalTransition'),
      
      
      showCharacterButton: document.getElementById('showCharacterSelection'),
      characterSelectionSection: document.getElementById('characterSelectionSection'),
      characterSelection: document.getElementById('characterSelection'),
      characterCards: document.querySelectorAll('.character-card'),
      startButton: document.getElementById('startAdventure'),
      
     
      scenarioSection: document.getElementById('scenarioSection'),
      scenarioTitle: document.getElementById('scenarioTitle'),
      scenarioDescription: document.getElementById('scenarioDescription'),
      choiceButtons: document.getElementById('choiceButtons'),
      feedbackMessage: document.getElementById('feedbackMessage'),
      feedbackText: document.getElementById('feedbackText'),
      nextQuestBtn: document.getElementById('nextQuestBtn'),
      
     
      securityContainer: document.getElementById('securityContainer'),
      securityBar: document.getElementById('securityBar')
    };
  
    
    function initialize() {
      setupLoadingSequence();
      setupEventListeners();
    }
  
  
    function setupLoadingSequence() {
      setTimeout(function () {
        ELEMENTS.loadingOverlay.style.display = 'none';
        ELEMENTS.mainContent.style.display = 'block';
      }, 2000);
    }
  
   
    function setupEventListeners() {
      
      ELEMENTS.showCharacterButton.addEventListener('click', showCharacterSelection);
      
      
      ELEMENTS.characterCards.forEach(card => {
        card.addEventListener('click', function() {
          selectCharacter(this);
        });
      });
      
      
      ELEMENTS.startButton.addEventListener('click', startAdventure);
      
      
      if (ELEMENTS.nextQuestBtn) {
        ELEMENTS.nextQuestBtn.addEventListener('click', handleNextQuest);
      }
    }
  
   
    function showCharacterSelection() {
      ELEMENTS.characterSelectionSection.style.display = 'block';
      ELEMENTS.characterSelection.style.display = 'flex';
      ELEMENTS.showCharacterButton.style.display = 'none';
      ELEMENTS.characterSelectionSection.scrollIntoView({ behavior: 'smooth' });
    }
  
    function selectCharacter(card) {
     
      ELEMENTS.characterCards.forEach(c => c.classList.remove('selected'));
      
      
      card.classList.add('selected');
      
      
      STATE.selectedCharacter = card.getAttribute('data-character');
      STATE.userChoices.character = STATE.selectedCharacter;
      
      
      ELEMENTS.startButton.disabled = false;
    }
  
    
    function startAdventure() {
      if (!STATE.selectedCharacter) return;
  
      
      saveUserChoices();
      
      
      ELEMENTS.portalTransition.classList.add('portal-active');
      
      
      setTimeout(function () {
        ELEMENTS.mainContent.style.display = 'none';
        ELEMENTS.portalTransition.classList.remove('portal-active');
        loadScenario("1");
      }, 1500);
    }
  
    
    function loadScenario(id) {
      fetch('scenarios.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const scenario = data.find(s => s.id === id);
          if (scenario) {
            STATE.currentScenario = scenario;
            showScenario(scenario);
          } else if (id.startsWith("end")) {
            showEnding();
          }
        })
        .catch(error => {
          console.error('Fejl ved indlæsning af scenarier:', error);
          alert('Kunne ikke indlæse scenarier. Se konsollen for detaljer.');
        });
    }
  
    function showScenario(scenario) {
      
      ELEMENTS.scenarioSection.style.display = "block";
      ELEMENTS.scenarioTitle.textContent = scenario.title;
      ELEMENTS.scenarioDescription.textContent = scenario.description;
      
      
      ELEMENTS.choiceButtons.innerHTML = "";
      
      
      scenario.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = choice.text;
        btn.onclick = () => handleChoice(choice);
        ELEMENTS.choiceButtons.appendChild(btn);
      });
      
      
      if (ELEMENTS.securityBar) {
        ELEMENTS.securityBar.value = STATE.securityLevel;
      }
      ELEMENTS.securityContainer.style.display = "block";
    }
  
    function handleChoice(choice) {
      
      STATE.userChoices.decisions.push({
        scenarioId: STATE.currentScenario.id,
        choice: choice.text,
        consequence: choice.consequence,
        correct: choice.correct
      });
      
      
      saveUserChoices();
      
      
      STATE.securityLevel += choice.correct ? 1 : -1;
      STATE.securityLevel = Math.max(0, Math.min(STATE.securityLevel, 5)); // Keep between 0-5
      
      if (ELEMENTS.securityBar) {
        ELEMENTS.securityBar.value = STATE.securityLevel;
      }
      
      
      showFeedback(choice);
    }
  
    function showFeedback(choice) {
      if (!ELEMENTS.feedbackMessage || !ELEMENTS.feedbackText || !ELEMENTS.nextQuestBtn) return;
      
      
      ELEMENTS.feedbackText.textContent = choice.consequence;
      

      ELEMENTS.nextQuestBtn.onclick = () => {
        ELEMENTS.feedbackMessage.classList.remove('show');
        if (choice.nextId.startsWith("end")) {
          showEnding();
        } else {
          loadScenario(choice.nextId);
        }
      };
      
      
      ELEMENTS.feedbackMessage.classList.add('show');
    }
  
    function handleNextQuest() {
      
    }
  
    
    function showEnding() {
      
      ELEMENTS.scenarioSection.style.display = "none";
      if (ELEMENTS.securityContainer) {
        ELEMENTS.securityContainer.style.display = "none";
      }
      
      
      document.body.innerHTML = "";
      createEndingScreen();
    }
  
    function createEndingScreen() {
      const resultPanel = document.createElement("main");
      resultPanel.className = "content-panel fade-in";
      
      
      const message = STATE.securityLevel >= 4
        ? "🌟 Du er den udvalgte! Din viden om datasikkerhed er legendarisk."
        : STATE.securityLevel >= 2
          ? "⚖️ Du undgik visse fælder, men faldt i andre. Træn videre, vogter!"
          : "☠️ Du banede vej for skyggerne... Riget er atter uden håb.";
      
      
      resultPanel.innerHTML = `
        <section class="ending-content">
          <h2 class="section-title">Dit resultat</h2>
          <p id="endingMessage">${message}</p>
        </section>
        
        <section class="video-container ending-video">
          <video id="endingVideo" class="intro-video" controls autoplay>
            <source src="video/fantasy-endless-hole-landscape.mp4" type="video/mp4">
            Din browser understøtter ikke video-elementet.
          </video>
        </section>
        
        <section class="center-content" id="seeChoicesContainer" style="display:none;">
          <button id="seeChoicesBtn" class="btn">Se dine valg</button>
        </section>
        
        <section id="choicesList" class="content-panel fade-in" style="display:none;"></section>
      `;
      
      document.body.appendChild(resultPanel);
      
      
      const endingVideo = document.getElementById("endingVideo");
      
      
      endingVideo.addEventListener('ended', () => {
        document.getElementById('seeChoicesContainer').style.display = "block";
      });
      
      
      document.getElementById('seeChoicesBtn').addEventListener('click', showUserChoices);
    }
  
    function showUserChoices() {
      
      document.querySelector('.ending-content').style.display = 'none';
      document.querySelector('.video-container').style.display = 'none';
      document.getElementById('seeChoicesBtn').style.display = 'none';
      
      
      const savedChoices = JSON.parse(localStorage.getItem('userChoices'));
      
      if (savedChoices && savedChoices.decisions.length > 0) {
        const choicesList = document.getElementById("choicesList");
        choicesList.style.display = "block";
        
        // Create HTML for user choices
        choicesList.innerHTML = `
          <h2>Dine valg undervejs</h2>
          <ul style="list-style: none; padding: 0;">
            ${savedChoices.decisions.map(decision => {
              const klass = decision.correct === true
                ? "choice-correct"
                : decision.correct === false
                  ? "choice-wrong"
                  : "choice-neutral";
  
              return `
                <li class="${klass}">
                  <strong>Scenarie ${decision.scenarioId}:</strong> ${decision.choice}
                  <br><em>${decision.consequence}</em>
                </li>
              `;
            }).join('')}
          </ul>
          <div class="center-content">
            <button id="restartAdventure" class="btn">Start forfra</button>
          </div>
        `;
        
        
        document.getElementById("restartAdventure").addEventListener('click', function () {
          location.reload();
        });
      }
    }
  
    
    function saveUserChoices() {
      localStorage.setItem('userChoices', JSON.stringify(STATE.userChoices));
    }
  
    
    initialize();
  });