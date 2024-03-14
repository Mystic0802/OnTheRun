# Architecture

One node application that can be ran from the command line.

## Frontend

Phones use simple HTML UI. KEEP IT SIMPLE.

For the main screen, use Pixi.js, a canvas library to make it look nice.

Admin UI will also be very simple.

Don't use a framework, as there is no point. Canvas will handle everything, phone ui is very simple

- Phone UI
- Main Screen UI
- Admin UI

## Backend

Node is the server runtime. Express for routing and static/dynamic serving.

Admin port/subdomain that is seperate from the phone URL.

Develop with the intention of running one game at a time, therefore we don't need a multi-game system using a code.


# Rulesets

## The Chase

1-4. 1 'chaser' vs 4 contestants.

Each contestant plays a cash builder round. One minute of quick-fire questions answered verbally, marked by the admin. Each correct question will add £1000 to their total wallet.
Offers are opened, with an upper, standard and lower offer. The chaser sets the values, WITH RESTRICTIONS.

There are 7 steps, the chaser starts off the board, stepping onto tile 7 on getting their first question right.
Questions to answer:
Upper - 6
Standard - 5
Lower - 4

Then the head-to-head starts. Multiple choice questions with 3 answers. Both the chaser and contestant answer at the same time.
The contestants answer is revealed first. The answer is then revealed. If the contestant is correct, they move one step forwards. If the contestant would
move off the board, they immediately win. If the contestant hasn't finished, the chasers answer is then revealed, and they move if they got it correct.
If the chaser would move onto the contestants tile, then the contestant is immediately eliminated for the rest of the game.

Once either the chaser or the contestant has selected a multiple-choice answer, a 5 second timer starts in which their opposite must submit their answer.

When the contestant moves off the board, their wallet is added to the team pot.

Each contestant plays one, individual, cash-builder and head-to-head section.
Once all players have done this, begin the final chase with the current team pot.

The whole team plays together for the final chase, where players buzz-in to answer questions verbally which are marked by the admin. If a player that did not buzz-in answers
the question, the answer is forfeit. Each correct answer adds one step to the ladder. The ladder starts with steps equal to the number of remaining contestants.
If no contestants remain for the final chase, one contestant is elected to answer questions alone, with the same ruleset applying. £4000 is used in place of their previous pot.
Quick-fire questions for 2 minutes.

The chaser then does the same thing using the same ruleset, answering questions to move one step in the ladder. If the chaser gets a question wrong, the contestants (one if alone), are then asked for their answer. If this answer is correct, the chaser moves one step back on the ladder, or one additional step is added if the chaser has zero steps completed. If the chaser completes all steps within the time limit, they win the game, and the contestants lose. If the timer runs out, and there are steps remaining, then they lose, and the contestants win.