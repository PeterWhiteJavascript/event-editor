Quintus.AI=function(Q){
    Q.CharacterAI = function(sprite) {
        if(1 /* AI is still very WIP */) {
            setTimeout(function() {
                Q.BatCon.endTurn();
            }, 500);
            return;
        }


        var attackWeights = weightAttack(sprite);

        let indexOfMaxWeight = attackWeights.reduce((iMax, elem, i, arr) => elem.score > arr[iMax].score ? i : iMax, 0);
        sprite.currentAIAction = attackWeights[indexOfMaxWeight];
        let attackTarget = sprite.currentAIAction.target;
        console.log("AI:", sprite.p.name, "want to attack", attackTarget.p.name + " <" + attackTarget.p.className + ">", attackWeights);

        doMove(sprite);
    };
    function weightAttack(me) {
        var averagePlyDamage = Q.BatCon.allies.reduce((total, plyChar) => {
            // todo: should also consider their skill damage
            return total + Q.BatCon.attackFuncs.calcBlowDamage(plyChar, me, 0.5);
        }, 0) / Q.BatCon.allies.length;
        var averagePlyHP = Q.BatCon.allies.reduce((total, plyChar) => {
            // todo: should also consider their armor
            return total + plyChar.p.maxHp;
        }, 0) / Q.BatCon.allies.length;

        return Q.BatCon.allies.map((plyChar) => {
            let damageAverage = Q.BatCon.attackFuncs.calcBlowDamage(me, plyChar, 0.5);
            let plyCharNewHP = Math.max(0, plyChar.p.hp - damageAverage);
            let score = 0;
            /*
             Damage
             + 1-20 based on health missing
             + 1-30 based on damage % we're about to do (this'll over favour killing the weak)
             + 10 if I'm going to kill them
             + -5-5 based on tankiness (their max health relative to the average max health of enemies)
             + -5-5 based on threat (their damage relative to the average of all enemies)
             */
            score += 20 * (1 - (plyChar.p.hp / plyChar.p.maxHp));
            score += 30 * ((plyChar.p.hp / plyChar.p.maxHp) - (plyCharNewHP / plyChar.p.maxHp));
            score += 10 * (plyCharNewHP <= 0);
            score += 5 * Math.min(1, Math.max(-1, Math.log2(plyChar.p.maxHp / averagePlyHP)));
            score += 5 * Math.min(1, Math.max(-1, Math.log2(Q.BatCon.attackFuncs.calcBlowDamage(plyChar, me, 0.5) / averagePlyDamage)));

            /*
             Movement required based on range of attack:
             +10 if I can reach them without moving
             -0 if I can reach them with 1 move (move + attack)
             -50 for each additional move required (could be scaled based on aggression/passiveness traits)
             - 1-50 if moving will trigger a ZoC attack on us (based on damage % we'll receive)
             */
            var distance = estimateMoveDistance(me, plyChar.p.loc);
            if(distance == 0) {
                // Can reach them without moving, bonus
                score += 10;
            } else {
                score -= 50 * (Math.ceil(distance / me.p.move) - 1);
            }
            return {score: score, action: 'attack', target: plyChar};
        });
    }

    function estimateMoveDistance(me, targetLoc) {
        var graph = me.p.walkMatrix;
        var start = graph.grid[me.p.loc[0]][me.p.loc[1]];
        // Todo: need to change to "find me a spot within range of x" instead of directly targetting x, since "closest" seems to often not work
        var end = graph.grid[targetLoc[0]][targetLoc[1]];
        var path = Q.astar.search(graph, start, end, {closest: true});
        if(path[path.length-1].closed) {
            // hack to make it not target the plyChar directly
            path.pop();
        }
        return Q.astar.sumPathWeight(path);
    }

    function doMove(me) {
        var target = me.currentAIAction.target;
        var graph = me.p.walkMatrix;
        var start = graph.grid[me.p.loc[0]][me.p.loc[1]];
        var end = graph.grid[target.p.loc[0]][target.p.loc[1]];
        var path = Q.astar.search(graph, start, end, {closest: true});

        // moveAlong doesn't care about how far we can move, so limit the path
        var weightSoFar = 0;
        path = path.filter((elem) => {
            weightSoFar += elem.weight;
            return weightSoFar <= me.p.move;
        }, 0);

        if(path.length) {
            me.moveAlong(path);
            me.on("startAIAction", function () {
                setTimeout(function () {
                    doAction(me);
                }, 500);
            });
        } else {
            doAction(me);
        }
    }

    function doAction(me) {
        if(me.currentAIAction.action === 'attack') {
            //Q.BatCon.attackFuncs.doAttack(me,[me.currentAIAction.target], false, me.p.didMove);
            Q.BatCon.attackFuncs.calcAttack(me, me.currentAIAction.target);
            setTimeout(function () {
                Q.BatCon.endTurn();
            }, 500);
        }
    }

    /**
     * Utility AI http://www.gamasutra.com/blogs/JakobRasmussen/20160427/271188/Are_Behavior_Trees_a_Thing_of_the_Past.php
     *  https://alastaira.wordpress.com/2013/01/25/at-a-glance-functions-for-modelling-utility-based-game-ai/
     *  is at least a good approach for identifying goals (kill weakest, kill nearest, heal me, run away)
     *  1. Identify possible actions, and write a scorer for each. Then, do whatever has the highest score.
     *      moveTowardsEnemy: might not count as a top level action in of itself, since other actions may/may not require it
     *      attack Enemy 1:
     *          AOE will need to (instead of attacking specific enemies), attempt to attack every tile and sum together all damage scores it'll do
     *
     *          Damage
     *          + 1-20 based on health missing
     *          + 1-30 based on damage % we're about to do (this'll over favour killing the weak)
     *          + 10 if I'm going to kill them
     *          + -5-5 based on tankiness (their max health relative to the average max health of enemies)
     *          + -5-5 based on threat (their damage relative to the average of all enemies)
     *
     *          Movement required based on range of attack:
     *          +10 if I can reach them without moving
     *          -0 if I can reach them with 1 move (move + attack)
     *          -50 for each additional move required (could be scaled based on aggression/passiveness traits)
     *          - 1-50 if moving will trigger a ZoC attack on us (based on damage % we'll receive)
     *      healAlly:
     *          + 1-20 based on health missing (ideally curved)
     *          + 1-30 based on healing % we're about to do
     *          actually this might just use the Damage calculation but in reverse for allies
     *
     *          Range (same as for attacking)
     *      Buffing:
     *          ?? who knows!
     *      blockChokepoint:
     *          taking suggestions
     *      retreating (without doing an action):
     *          how scared they are + health missing %
     *      coverAlly:
     *          ???
     *
     *      backstepping (retreating partially, but still within range of doing an action):
     *          Not actually exclusive of the other actions
     *          if(chosenActionRange > 3 and enemy within range*0.66) {
     *            find a place to backstep to that's further
     *          }
     *
     *
     *
     * Stack based FSM https://gamedevelopment.tutsplus.com/tutorials/finite-state-machines-theory-and-implementation--gamedev-11867
     *  seems like a decent rough starting idea for allowing action chains ie. [Base goal: Kill white mage, attack white mage, move closer]
     *
     * "Strive for overall win state %" is an interesting idea, may approach later
     *  1. write algorithm that identifies by what % we're currently winning the battle (ie. if we have 9 dudes, enemy has 1, that's better than 9:2)
     *  2. run through all options, running the algorithm on the predicted state after performing each action
     *  3. Actually perform the action that resulted in the highest win %
     */
};
