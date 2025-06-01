let players = [];
let currentPlayerIndex = 0;
let currentRound = 1;
let selectedInvestment = null;
let diceRolled = false;

const investments = {
    'acoes': {
        name: 'Ações',
        effects: { 1: -0.15, 2: -0.15, 3: 0.05, 4: 0.05, 5: 0.20, 6: 0.20 }
    },
    'renda-fixa': {
        name: 'Renda Fixa',
        effects: { 1: 0.02, 2: 0.02, 3: 0.02, 4: 0.02, 5: 0.02, 6: 0.02 }
    },
    'fii': {
        name: 'FII',
        effects: { 1: -0.05, 2: -0.05, 3: 0.05, 4: 0.05, 5: 0.10, 6: 0.10 }
    },
    'cripto': {
        name: 'Cripto',
        effects: { 1: -0.25, 2: -0.25, 3: 0.10, 4: 0.10, 5: 0.50, 6: 0.50 }
    }
};

const marketEvents = [
    { title: "Crise Política", effect: -0.10, description: "Instabilidade política causa queda geral de 10% nos investimentos!" },
    { title: "Alta da Selic", effect: 0.05, description: "Banco Central sobe juros. Todos ganham 5% extra!" },
    { title: "Boom Tecnológico", effect: 0.15, description: "Revolução tech! Todos os investimentos sobem 15%!" },
    { title: "Recessão Global", effect: -0.20, description: "Crise mundial! Todos perdem 20% dos investimentos!" },
    { title: "Descoberta de Petróleo", effect: 0.12, description: "Nova reserva descoberta! Economia aquece 12%!" }
];

function startGame() {
    players = [];
    
    for (let i = 1; i <= 4; i++) {
        const name = document.getElementById(`player${i}`).value.trim();
        if (name) {
            players.push({
                name: name,
                balance: 10000,
                history: []
            });
        }
    }

    if (players.length < 2) {
        alert('É necessário pelo menos 2 jogadores!');
        return;
    }

    document.getElementById('setup').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    updateGameInfo();
    renderPlayers();
}

function updateGameInfo() {
    document.getElementById('currentRound').textContent = currentRound;
    document.getElementById('currentPlayer').textContent = players[currentPlayerIndex].name;
    document.getElementById('remainingRounds').textContent = 7 - currentRound;
}

function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    grid.innerHTML = '';

    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `player-card ${index === currentPlayerIndex ? 'active' : ''}`;
        card.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-balance">R$ ${player.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
        `;
        grid.appendChild(card);
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.investment-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            cards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedInvestment = this.dataset.investment;
        });
    });
});

function rollDice() {
    if (!selectedInvestment) {
        alert('Escolha um investimento primeiro!');
        return;
    }

    if (diceRolled) return;

    const dice = document.getElementById('dice');
    const result = Math.floor(Math.random() * 6) + 1;
    
    dice.textContent = result;
    dice.style.animation = 'roll 0.5s ease-in-out';
    
    setTimeout(() => {
        dice.style.animation = '';
        processInvestment(result);
    }, 500);

    diceRolled = true;
}

function processInvestment(diceResult) {
    const player = players[currentPlayerIndex];
    const investment = investments[selectedInvestment];
    const effect = investment.effects[diceResult];
    
    const change = player.balance * effect;
    const newBalance = player.balance + change;
    
    player.balance = Math.max(0, newBalance);
    player.history.push({
        round: currentRound,
        investment: investment.name,
        dice: diceResult,
        effect: effect,
        change: change,
        balance: player.balance
    });

    const resultText = change >= 0 ? 
        `+R$ ${change.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` :
        `-R$ ${Math.abs(change).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    document.getElementById('diceResult').innerHTML = `
        <strong>${investment.name}</strong><br>
        Dado: ${diceResult} | Efeito: ${(effect * 100).toFixed(1)}%<br>
        ${resultText}<br>
        Novo saldo: R$ ${player.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
    `;

    renderPlayers();
    document.getElementById('nextTurnBtn').style.display = 'inline-block';
}

function nextTurn() {
    currentPlayerIndex++;
    
    if (currentPlayerIndex >= players.length) {
        currentPlayerIndex = 0;
        currentRound++;
    }

    if (currentRound > 6) {
        endGame();
        return;
    }

    selectedInvestment = null;
    diceRolled = false;
    document.getElementById('dice').textContent = '?';
    document.getElementById('diceResult').textContent = '';
    document.getElementById('nextTurnBtn').style.display = 'none';
    document.querySelectorAll('.investment-card').forEach(card => {
        card.classList.remove('selected');
    });

    updateGameInfo();
    renderPlayers();
}

function triggerMarketEvent() {
    const event = marketEvents[Math.floor(Math.random() * marketEvents.length)];
    

    players.forEach(player => {
        const change = player.balance * event.effect;
        player.balance = Math.max(0, player.balance + change);
    });

    document.getElementById('eventDescription').innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <p><strong>Efeito: ${(event.effect * 100).toFixed(1)}%</strong></p>
    `;
    
    document.getElementById('eventModal').style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    renderPlayers();
    
    if (currentRound > 6) {
        endGame();
    } else {
        updateGameInfo();
    }
}

function endGame() {
    const sortedPlayers = [...players].sort((a, b) => b.balance - a.balance);
    
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('finalResults').style.display = 'block';
    
    document.getElementById('winnerAnnouncement').textContent = 
        `🏆 ${sortedPlayers[0].name} Venceu!`;
    
    let scoreboard = '<h3>Classificação Final:</h3>';
    sortedPlayers.forEach((player, index) => {
        const profit = player.balance - 10000;
        const profitPercent = ((profit / 10000) * 100).toFixed(1);
        
        scoreboard += `
            <p><strong>${index + 1}º lugar:</strong> ${player.name} - 
            R$ ${player.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})} 
            (${profit >= 0 ? '+' : ''}${profitPercent}%)</p>
        `;
    });
    
    document.getElementById('finalScoreboard').innerHTML = scoreboard;
}

function resetGame() {
    currentPlayerIndex = 0;
    currentRound = 1;
    selectedInvestment = null;
    diceRolled = false;
    
    document.getElementById('finalResults').style.display = 'none';
    document.getElementById('setup').style.display = 'block';

    for (let i = 1; i <= 4; i++) {
        if (i > 2) {
            document.getElementById(`player${i}`).value = '';
        }
    }
}