let jogadores = [];
        let indiceJogadorAtual = 0;
        let rodadaAtual = 1;
        let investimentoSelecionado = null;
        let dadoRolado = false;

        const investimentos = {
            'acoes': { nome: 'Ações', efeitos: { 1: -0.15, 2: -0.15, 3: 0.05, 4: 0.05, 5: 0.20, 6: 0.20 } },
            'renda-fixa': { nome: 'Renda Fixa', efeitos: { 1: 0.02, 2: 0.02, 3: 0.02, 4: 0.02, 5: 0.02, 6: 0.02 } },
            'fii': { nome: 'FII', efeitos: { 1: -0.05, 2: -0.05, 3: 0.05, 4: 0.05, 5: 0.10, 6: 0.10 } },
            'cripto': { nome: 'Cripto', efeitos: { 1: -0.25, 2: -0.25, 3: 0.10, 4: 0.10, 5: 0.50, 6: 0.50 } }
        };

        const eventosMercado = [
            { titulo: "Péssimo dia de Pregão", descricao: "O jogador com mais dinheiro perde 10%!", tipo: "mais_rico_perde" },
            { titulo: "Investiu em um Unicórnio", descricao: "O jogador com menos dinheiro ganha 30%!", tipo: "mais_pobre_ganha" },
            { titulo: "Quinta-Feira Negra Parte 2", descricao: "Todos os jogadores perdem 60%!", tipo: "todos_perdem" }
        ];

        function iniciarJogo() {
            jogadores = [];
            
            for (let i = 1; i <= 4; i++) {
                const nome = document.getElementById(`player${i}`).value.trim();
                if (nome) {
                    jogadores.push({ nome: nome, saldo: 10000 });
                }
            }

            if (jogadores.length < 2) {
                alert('É necessário pelo menos 2 jogadores!');
                return;
            }

            document.getElementById('setup').style.display = 'none';
            document.getElementById('gameBoard').style.display = 'block';
            
            atualizarInfoJogo();
            renderizarJogadores();
        }

        function atualizarInfoJogo() {
            document.getElementById('currentRound').textContent = rodadaAtual;
            document.getElementById('currentPlayer').textContent = jogadores[indiceJogadorAtual].nome;
            document.getElementById('remainingRounds').textContent = 7 - rodadaAtual;
        }

        function renderizarJogadores() {
            const grade = document.getElementById('playersGrid');
            grade.innerHTML = '';

            jogadores.forEach((jogador, indice) => {
                const cartao = document.createElement('div');
                cartao.className = `player-card ${indice === indiceJogadorAtual ? 'active' : ''}`;
                cartao.innerHTML = `
                    <div class="player-name">${jogador.nome}</div>
                    <div class="player-balance">R$ ${jogador.saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                `;
                grade.appendChild(cartao);
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.investment-card').forEach(cartao => {
                cartao.addEventListener('click', function() {
                    document.querySelectorAll('.investment-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    investimentoSelecionado = this.dataset.investment;
                });
            });
        });

        function rolarDado() {
            if (!investimentoSelecionado) {
                alert('Escolha um investimento primeiro!');
                return;
            }
            if (dadoRolado) return;

            const dado = document.getElementById('dice');
            const resultado = Math.floor(Math.random() * 6) + 1;
            
            dado.textContent = resultado;
            dado.style.animation = 'roll 0.5s ease-in-out';
            
            setTimeout(() => {
                dado.style.animation = '';
                processarInvestimento(resultado);
            }, 500);

            dadoRolado = true;
        }

        function processarInvestimento(resultadoDado) {
            const jogador = jogadores[indiceJogadorAtual];
            const investimento = investimentos[investimentoSelecionado];
            const efeito = investimento.efeitos[resultadoDado];
            
            const mudanca = jogador.saldo * efeito;
            jogador.saldo = Math.max(0, jogador.saldo + mudanca);

            const textoResultado = mudanca >= 0 ? 
                `+R$ ${mudanca.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` :
                `-R$ ${Math.abs(mudanca).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            
            document.getElementById('diceResult').innerHTML = `
                <strong>${investimento.nome}</strong><br>
                Dado: ${resultadoDado} | Efeito: ${(efeito * 100).toFixed(1)}%<br>
                ${textoResultado}<br>
                Novo saldo: R$ ${jogador.saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            `;

            renderizarJogadores();
            document.getElementById('nextTurnBtn').style.display = 'inline-block';
        }

        function proximoTurno() {
            indiceJogadorAtual++;
            
            if (indiceJogadorAtual >= jogadores.length) {
                indiceJogadorAtual = 0;
                rodadaAtual++;
                
                // Evento a cada 2 rodadas
                if (rodadaAtual % 2 === 1 && rodadaAtual > 1) {
                    ativarEventoMercado();
                    return;
                }
            }

            if (rodadaAtual > 6) {
                finalizarJogo();
                return;
            }

            resetarTurno();
            atualizarInfoJogo();
            renderizarJogadores();
        }

        function resetarTurno() {
            investimentoSelecionado = null;
            dadoRolado = false;
            document.getElementById('dice').textContent = '?';
            document.getElementById('diceResult').textContent = '';
            document.getElementById('nextTurnBtn').style.display = 'none';
            document.querySelectorAll('.investment-card').forEach(cartao => {
                cartao.classList.remove('selected');
            });
        }

        function ativarEventoMercado() {
            const evento = eventosMercado[Math.floor(Math.random() * eventosMercado.length)];
            
            if (evento.tipo === "mais_rico_perde") {
                const maisRico = jogadores.reduce((max, jogador) => jogador.saldo > max.saldo ? jogador : max);
                const perda = maisRico.saldo * 0.10;
                maisRico.saldo = Math.max(0, maisRico.saldo - perda);
                
            } else if (evento.tipo === "mais_pobre_ganha") {
                const maisPobre = jogadores.reduce((min, jogador) => jogador.saldo < min.saldo ? jogador : min);
                const ganho = maisPobre.saldo * 0.30;
                maisPobre.saldo += ganho;
                
            } else if (evento.tipo === "todos_perdem") {
                jogadores.forEach(jogador => {
                    const perda = jogador.saldo * 0.60;
                    jogador.saldo = Math.max(0, jogador.saldo - perda);
                });
            }

            document.getElementById('eventDescription').innerHTML = `
                <h3>${evento.titulo}</h3>
                <p>${evento.descricao}</p>
            `;
            
            document.getElementById('eventModal').style.display = 'flex';
        }

        function fecharModalEvento() {
            document.getElementById('eventModal').style.display = 'none';
            renderizarJogadores();
            
            if (rodadaAtual > 6) {
                finalizarJogo();
            } else {
                atualizarInfoJogo();
            }
        }

        function finalizarJogo() {
            const jogadoresOrdenados = [...jogadores].sort((a, b) => b.saldo - a.saldo);
            
            document.getElementById('gameBoard').style.display = 'none';
            document.getElementById('finalResults').style.display = 'block';
            
            document.getElementById('winnerAnnouncement').textContent = 
                `🏆 ${jogadoresOrdenados[0].nome} Venceu!`;
            
            let placar = '<h3>Classificação Final:</h3>';
            jogadoresOrdenados.forEach((jogador, indice) => {
                const lucro = jogador.saldo - 10000;
                const porcentagemLucro = ((lucro / 10000) * 100).toFixed(1);
                u
                placar += `
                    <p><strong>${indice + 1}º lugar:</strong> ${jogador.nome} - 
                    R$ ${jogador.saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})} 
                    (${lucro >= 0 ? '+' : ''}${porcentagemLucro}%)</p>
                `;
            });
            
            document.getElementById('finalScoreboard').innerHTML = placar;
        }

        function reiniciarJogo() {
            indiceJogadorAtual = 0;
            rodadaAtual = 1;
            investimentoSelecionado = null;
            dadoRolado = false;
            
            document.getElementById('finalResults').style.display = 'none';
            document.getElementById('setup').style.display = 'block';

            for (let i = 1; i <= 4; i++) {
                if (i > 2) {
                    document.getElementById(`player${i}`).value = '';
                }
            }
        }
        function startGame() { iniciarJogo(); }
        function rollDice() { rolarDado(); }
        function nextTurn() { proximoTurno(); }
        function closeEventModal() { fecharModalEvento(); }
        function resetGame() { reiniciarJogo(); }