export interface SampleNote {
  id: string;
  title: string;
  subject: string;
  academicLevel: string;
  description: string;
  content: string;
}

export const SAMPLE_NOTES: SampleNote[] = [
  {
    id: 'bio-respiration',
    title: 'Cellular Respiration & ATP Synthesis',
    subject: 'Biology / Biochemistry',
    academicLevel: 'Undergraduate / College',
    description: 'Glycolysis, Krebs Cycle, Oxidative Phosphorylation, and Chemiosmosis',
    content: `Cellular Respiration & Energy Production (BIO 201 Lecture Notes)

1. Overview of Cellular Respiration:
Cellular respiration is the catabolic pathway by which organic molecules (primarily glucose) are broken down to produce ATP (adenosine triphosphate).
Overall chemical reaction:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30-32 ATP + heat.
The process is exergonic (delta G = -686 kcal/mol under standard conditions) and consists of four main stages:
Stage 1: Glycolysis (in cytosol)
Stage 2: Pyruvate Oxidation / Link Reaction (mitochondrial matrix)
Stage 3: Citric Acid Cycle / Krebs Cycle (mitochondrial matrix)
Stage 4: Oxidative Phosphorylation & Electron Transport Chain (inner mitochondrial membrane)

2. Stage 1: Glycolysis
- Location: Cytoplasm/Cytosol.
- Anaerobic: Does NOT require molecular oxygen.
- Energy Investment Phase: 2 ATP consumed to phosphorylate glucose (catalyzed by Hexokinase and Phosphofructokinase-1 / PFK-1). PFK-1 is the primary rate-limiting enzyme regulated allosterically by ATP/AMP ratios.
- Energy Payoff Phase: 4 ATP generated via substrate-level phosphorylation (net gain of 2 ATP), 2 NADH produced from NAD+ reduction, and 2 Pyruvate (3-carbon molecule) generated per glucose.
- Net output per glucose: 2 ATP, 2 NADH, 2 Pyruvate, 2 H2O.

3. Stage 2: Pyruvate Oxidation (The Transition Step)
- Pyruvate enters the mitochondrial matrix via a transport protein (mitochondrial pyruvate carrier).
- Pyruvate dehydrogenase multienzyme complex (PDC) decarboxylates pyruvate:
  a) Carboxyl group removed as CO2 (first waste CO2 produced).
  b) Remaining 2-carbon fragment oxidized, reducing NAD+ to NADH.
  c) Coenzyme A attached to form Acetyl-CoA.
- Yield per glucose (2 pyruvates): 2 Acetyl-CoA, 2 NADH, 2 CO2.

4. Stage 3: The Citric Acid (Krebs) Cycle
- Acetyl-CoA (2C) combines with Oxaloacetate (4C) to form Citrate (6C), catalyzed by Citrate Synthase.
- Two successive decarboxylation steps release 2 CO2 per turn.
- High-energy electron carriers: 3 NADH and 1 FADH2 generated per turn.
- 1 GTP (converted to ATP) generated via substrate-level phosphorylation per turn.
- Regeneration of Oxaloacetate (4C) enables the cycle to repeat.
- Total per glucose (2 turns): 4 CO2, 6 NADH, 2 FADH2, 2 ATP/GTP.

5. Stage 4: Oxidative Phosphorylation & Chemiosmosis
- Complexes I, II, III, and IV embedded in the inner mitochondrial membrane (cristae).
- Complex I accepts electrons from NADH; Complex II accepts electrons from FADH2 (lower energy yield).
- Electrons flow down redox potential gradients through ubiquinone (CoQ) and cytochrome c to Complex IV.
- Final electron acceptor is O2, which is reduced along with H+ to form H2O.
- Proton Pumping: Complexes I, III, and IV pump protons (H+) from the matrix into the intermembrane space, generating a steep electrochemical gradient (Proton Motive Force / PMF).
- ATP Synthase (F0-F1 rotor complex): Uses the exergonic flux of H+ back into matrix to phosphorylate ADP + Pi -> ATP (Chemiosmotic coupling proposed by Peter Mitchell).
- Theoretical yield: ~2.5 ATP per NADH, ~1.5 ATP per FADH2.
- Total aerobic yield: ~30-32 ATP per glucose molecule.
- Uncouplers (e.g., 2,4-DNP, thermogenin in brown fat) dissipate the proton gradient without synthesizing ATP, releasing energy solely as heat.`,
  },
  {
    id: 'cs-concurrency',
    title: 'Operating Systems: Concurrency, Synchronization & Deadlocks',
    subject: 'Computer Science',
    academicLevel: 'Undergraduate / College',
    description: 'Race conditions, critical sections, mutexes, semaphores, and Coffman deadlock conditions',
    content: `CS 340: Operating Systems & Systems Programming
Topic: Concurrency, Mutual Exclusion, and Deadlocks

1. Threads vs Processes:
- A Process is an execution unit with private virtual memory address space, file descriptor tables, and IPC overhead.
- A Thread is a lightweight execution flow sharing the process address space, heap, and open files, but having its own Program Counter (PC), CPU registers, and call stack.
- Benefit: High throughput, shared cache, cheap context switching.
- Hazard: Race conditions when multiple threads access shared mutable state without proper synchronization.

2. Critical Section Problem & Mutual Exclusion:
A Critical Section (CS) is a segment of code where shared resources are accessed.
Requirements for a valid solution:
1. Mutual Exclusion: At most one thread can execute within the critical section at any given time.
2. Progress: If no thread is in the CS and threads want to enter, selection cannot be postponed indefinitely.
3. Bounded Waiting: A bound must exist on the number of times other threads enter the CS after a thread has requested entry (prevents starvation).

3. Synchronization Primitives:
- Mutex (Mutual Exclusion Lock): A binary lock with ownership. The thread that acquires the lock must be the one that releases it. Implemented using atomic hardware instructions: Test-and-Set (TAS) or Compare-and-Swap (CAS).
- Spinlocks: Busy-waiting loops. Efficient only for short critical sections on multi-core architectures where context switch latency exceeds lock hold time.
- Counting Semaphore: Integer value S with two atomic operations:
  * sem_wait(S) / P(S): Decrements S. If S < 0, caller blocks.
  * sem_post(S) / V(S): Increments S. If S <= 0, wakes a blocked thread.
  * Can manage a finite pool of identical resources.
- Condition Variables: Mechanism for threads to sleep until a specific condition becomes true. Must always be used inside a while loop with an associated mutex to guard against spurious wakeups.

4. Deadlocks:
A deadlock is a permanent state where a set of processes are blocked because each process holds a resource and waits for another resource held by another process in the set.

The 4 Coffman Conditions (ALL must hold simultaneously for a deadlock to occur):
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and requesting additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly seized; only released voluntarily by the holding process.
4. Circular Wait: A closed chain of processes exists: P0 waits for P1, P1 waits for P2 ... Pn waits for P0.

Deadlock Handling Strategies:
- Prevention: Invalidate at least one Coffman condition (e.g., impose global strict total ordering on resource acquisition IDs to eliminate Circular Wait).
- Avoidance: Banker's Algorithm (Dijkstra) verifies if granting a resource keeps the system in a "Safe State".
- Detection and Recovery: Maintain Resource Allocation Graph (RAG); detect cycles using DFS. Recovery involves process termination or resource preemption with checkpoint rollback.
- Ostrich Algorithm: Ignore the problem if occurrence is exceptionally rare (used by standard desktop OS kernels).`,
  },
  {
    id: 'econ-monetary',
    title: 'Macroeconomics: Monetary Policy, Inflation & Central Banking',
    subject: 'Economics / Finance',
    academicLevel: 'Undergraduate / College',
    description: 'Federal Reserve tools, Taylor Rule, aggregate demand, inflation targeting, and stagflation',
    content: `ECON 302: Intermediate Macroeconomics
Topic: Central Bank Monetary Policy, Money Supply, and Inflation

1. Central Bank Dual Mandate:
Most modern central banks (e.g., Federal Reserve) operate under a dual mandate:
1. Maximum Sustainable Employment.
2. Price Stability (typically defined as a symmetric 2% annual inflation target on Core PCE / CPI).

2. Monetary Policy Transmission Mechanism:
How interest rate changes influence the real economy:
- Step 1: Central Bank sets the policy rate (Federal Funds Rate / overnight interbank lending rate).
- Step 2: Commercial bank prime rates, corporate bond yields, and mortgage rates adjust accordingly.
- Step 3: High interest rates increase borrowing costs -> suppresses consumer durable spending and capital investment (I). Increases incentive to save rather than consume (C).
- Step 4: Exchange rate channel: higher domestic yield attracts foreign capital -> currency appreciates -> net exports (NX) decrease.
- Step 5: Aggregate Demand (AD = C + I + G + NX) shifts left, cooling GDP growth and dampening demand-pull inflationary pressure.

3. Central Bank Policy Tools:
a) Open Market Operations (OMO): Buying/selling government securities. Buying expands bank reserves (easing); selling drains reserves (tightening).
b) Interest on Reserve Balances (IORB): Administered floor rate paid on excess reserves held by banks.
c) Overnight Reverse Repo Facility (ON RRP): Sets a firm floor under overnight money market rates.
d) Discount Window: Lender of last resort rate for banks facing temporary liquidity shortages.
e) Quantitative Easing (QE) & Quantitative Tightening (QT): Large-scale asset purchases across long-duration maturities to influence term premiums.

4. Inflation Types:
- Demand-Pull Inflation: "Too much money chasing too few goods". AD shifts right beyond potential output (Y > Y*).
- Cost-Push Inflation: Supply shocks (e.g., sudden oil embargo or semiconductor shortage) shift Short-Run Aggregate Supply (SRAS) left. Leads to Stagflation (stagnant growth + high inflation + rising unemployment).
- Built-in / Inertial Inflation: Wage-price spiral where workers anticipate higher prices and demand higher wages, raising firms' production costs.

5. The Taylor Rule:
A prescriptive monetary policy rule calculating the nominal target interest rate:
i_t = r* + pi_t + 0.5(pi_t - pi*) + 0.5(y_t - y*)
Where:
- r* is the neutral real interest rate.
- pi_t is current inflation rate, pi* is central bank inflation target.
- (y_t - y*) is the output gap (% deviation of real GDP from potential).`,
  },
  {
    id: 'psych-memory',
    title: 'Cognitive Psychology: Memory Systems, Encoding & Retrieval',
    subject: 'Psychology / Neuroscience',
    academicLevel: 'Undergraduate / College',
    description: 'Atkinson-Shiffrin model, working memory, long-term memory types, and forgetting curve',
    content: `PSYC 210: Cognitive Psychology
Lecture Notes: Memory Architecture, Working Memory, and Forgetting

1. The Multi-Store Model of Memory (Atkinson & Shiffrin, 1968):
Information flows through three sequential structural memory stores:
- Sensory Memory: Brief sensory registration (Iconic memory for visual ~250-500ms; Echoic memory for auditory ~3-4 seconds). Sperling's partial-report paradigm demonstrated massive sensory capacity with rapid decay.
- Short-Term Memory (STM): Limited capacity (Miller's 7 +/- 2 chunks, updated by Cowan to ~4 chunks). Duration ~15-30 seconds without rehearsal.
- Long-Term Memory (LTM): Theoretically infinite capacity and duration.

2. Baddeley & Hitch Working Memory Model (1974 / 2000):
Replaced passive STM with an active, multi-component executive workspace:
1. Central Executive: Attention controller, task switching, inhibits distractors, allocates resources.
2. Phonological Loop:
   - Phonological store ("inner ear"): Holds acoustic/speech info for 1-2s.
   - Articulatory rehearsal loop ("inner voice"): Subvocal repetition (word length effect, phonological similarity effect).
3. Visuospatial Sketchpad: Mental manipulation of visual imagery and spatial coordinates (Corsi blocks test, mental rotation tasks).
4. Episodic Buffer (added in 2000): Integrates information across visual, verbal, and temporal modalities with LTM into coherent episodic chunks.

3. Long-Term Memory Taxonomy:
LTM is divided into two major branches:
a) Declarative / Explicit Memory (Conscious recall, Hippocampus and medial temporal lobe dependent):
   - Episodic Memory: Personal autobiographical events with spatiotemporal context ("mental time travel").
   - Semantic Memory: Generalized factual world knowledge, concepts, meanings without personal context.
b) Non-Declarative / Implicit Memory (Expressed through performance without conscious awareness):
   - Procedural Memory: Motor skills and habits (striatum and cerebellum; intact in patient H.M.).
   - Priming: Enhanced identification or processing of stimulus after prior exposure (neocortex).
   - Classical Conditioning: Pavlovian stimulus-response associations (amygdala for fear conditioning).

4. Levels of Processing (Craik & Lockhart, 1972):
Memory retention depends on the depth of mental processing during encoding rather than rehearsal time:
- Structural/Shallow: Physical visual features (e.g. UPPERCASE letters) -> poorest retention.
- Phonemic: Rhyme / sound qualities -> intermediate retention.
- Semantic/Deep: Meaning, relevance, personal connections (Self-reference effect) -> strongest retention.

5. Retrieval & Forgetting:
- Ebbinghaus Forgetting Curve: Exponential decay of newly learned info within first 24-48 hours.
- Spaced Repetition / Distributed Practice: Combats exponential decay by spacing review sessions over expanding intervals.
- Testing Effect (Retrieval Practice): Actively retrieving knowledge from memory creates stronger neural pathways than passive re-reading.
- Interference Theory:
  * Proactive Interference: Old memories hinder recall of new information.
  * Retroactive Interference: New information disrupts recall of older memories.`,
  },
];
