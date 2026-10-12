import type { Project, JourneyMilestone, BlogPost, Article, Service, JournalEntry, StreakDay } from '../types'
import { SITE_URL } from '../lib/apiConfig'

// Switch to false when real published content is ready to replace the demo previews.
export const contentSettings = { demoMode: true, timeZone: 'Asia/Kolkata' }

// ─── Site Config ─────────────────────────────────────────────────────────────

export const siteConfig = {
  name: 'Prince Monga',
  tagline: 'Full-Stack Developer & Cybersecurity Learner',
  location: 'Gurugram / Sirsa, Haryana, India',
  phone: '+91 95182 19823',
  email: 'princemonga421@gmail.com',
  github: 'https://github.com/prince-monga',
  linkedin: 'https://linkedin.com/in/prince-monga-',
  tryhackme: 'https://tryhackme.com/p/princemonga',
  twitter: 'https://x.com/Prince_monga7',
  canonicalUrl: SITE_URL,
  // Set to an absolute URL once you create an OG image (1200x630 PNG recommended)
  ogImage: '',
  // Google Search Console verification meta tag value — set after you verify
  gscVerification: '',
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillGroups = [
  {
    group: 'Programming',
    items: ['Java', 'JavaScript', 'Python', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    group: 'Web & Frameworks',
    items: ['React.js', 'Flask', 'WordPress', 'Shopify', 'Pandas', 'NumPy'],
  },
  {
    group: 'Databases & Tools',
    items: ['MySQL', 'PostgreSQL', 'Git', 'GitHub', 'VS Code'],
  },
  {
    group: 'Networking & Security',
    items: ['TCP/IP', 'DNS', 'Firewalls', 'Wireshark', 'Nmap', 'Kali Linux', 'Cryptography'],
  },
]

// ─── Certifications ───────────────────────────────────────────────────────────

export const certifications = [
  {
    id: 'cert-1',
    title: 'Pre Security (SEC0)',
    issuer: 'TryHackMe',
    url: 'https://tryhackme.com/p/princemonga',
  },
  {
    id: 'cert-2',
    title: 'Java Full Stack Development',
    issuer: 'JSpiders Institute',
    url: undefined,
  },
  {
    id: 'cert-3',
    title: 'Advanced Diploma in IT Management',
    issuer: 'Abhyas Academy',
    url: undefined,
  },
  {
    id: 'cert-4',
    title: 'ChatGPT Prompt Engineering Mastery',
    issuer: 'Udemy',
    url: undefined,
  },
]

export const githubAchievements = ['Pull Shark', 'YOLO', 'Quickdraw']

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: 'project-1',
    slug: 'smart-career-predictor',
    title: 'Smart Career Predictor',
    problem: 'Students struggle to identify suitable career paths based on their skills and interests without personalised guidance.',
    description: 'A full-stack career guidance tool that integrates a Python/Flask ML backend with a React frontend. Uses Pandas and NumPy to process user inputs and return dynamic career recommendations.',
    tech: ['React', 'Python', 'Flask', 'Pandas', 'NumPy'],
    category: 'Full Stack',
    repoUrl: undefined,
    liveUrl: undefined,
    status: 'complete',
    featured: true,
    goals: [
      'Build an end-to-end full-stack application connecting React to a Python ML backend',
      'Provide personalised career recommendations based on user-supplied skills and interests',
      'Keep the ML pipeline simple and explainable rather than a black box',
    ],
    features: [
      'React frontend with a multi-step input form',
      'Flask REST API serving career prediction results',
      'Pandas/NumPy data processing pipeline',
      'Dynamic recommendation output with reasoning',
    ],
    architecture: 'React SPA communicates with a Flask REST API over HTTP. The Flask backend loads a pre-processed dataset using Pandas, applies matching logic with NumPy, and returns ranked career suggestions as JSON.',
    challenges: 'Connecting a React frontend to a Python backend required careful handling of CORS and data serialisation. Designing the recommendation logic to feel useful without overcomplicating the ML side was the main product challenge.',
    decisions: 'Chose Flask over Django for its simplicity — the backend only needed to serve a few API endpoints. Used Pandas for data wrangling because it was already part of the data processing workflow.',
    learnings: 'This project taught me how to bridge two different technology ecosystems (JavaScript and Python) through a clean API contract. It also reinforced how much product thinking matters — the ML logic was less important than making the output feel useful.',
  },
  {
    id: 'project-2',
    slug: 'secure-atm-simulation',
    title: 'Secure ATM Simulation System',
    problem: 'A learning project to understand secure application design patterns — specifically PIN-based authentication, session management, and basic encryption in a console environment.',
    description: 'A console-based banking simulation built in Core Java. Implements PIN encryption, session timeout controls, and basic account operations to demonstrate secure application design principles.',
    tech: ['Java', 'Core Java'],
    category: 'Backend',
    repoUrl: undefined,
    liveUrl: undefined,
    status: 'complete',
    featured: true,
    goals: [
      'Implement PIN-based authentication with basic encryption',
      'Add session timeout to simulate real ATM security behaviour',
      'Practice object-oriented design in Java',
    ],
    features: [
      'PIN encryption and secure authentication flow',
      'Session timeout with automatic logout',
      'Account balance enquiry, withdrawal, and deposit',
      'Transaction history within a session',
    ],
    architecture: 'Pure Java console application using OOP principles. Account data is held in memory for the session. PIN storage uses basic hashing to demonstrate the concept without external libraries.',
    challenges: 'Implementing session timeout in a synchronous console application required thinking carefully about state management without a framework to help.',
    decisions: 'Kept it as a pure Java project with no external dependencies to focus on the core concepts rather than library integration.',
    learnings: 'Deepened my understanding of Java OOP, basic cryptography concepts, and why security has to be designed in from the start rather than added later.',
  },
  {
    id: 'project-3',
    slug: 'network-traffic-analyzer',
    title: 'Network Traffic Analyzer',
    problem: 'Understanding network vulnerabilities requires hands-on experience with real traffic analysis and port scanning tools.',
    description: 'A network security project combining Wireshark packet capture, Nmap port scanning, and Python scripting to detect and document network vulnerabilities in a controlled lab environment.',
    tech: ['Python', 'Wireshark', 'Nmap', 'Kali Linux'],
    category: 'Experiment',
    repoUrl: undefined,
    liveUrl: undefined,
    status: 'complete',
    featured: false,
    goals: [
      'Learn practical network traffic analysis using Wireshark',
      'Automate port scanning and result parsing with Python and Nmap',
      'Document findings in a structured vulnerability report format',
    ],
    features: [
      'Wireshark-based packet capture and protocol analysis',
      'Nmap port scanning with Python automation',
      'Vulnerability detection and documentation',
      'Lab environment setup on Kali Linux',
    ],
    architecture: 'Python scripts wrap Nmap commands and parse XML output. Wireshark captures are analysed manually and cross-referenced with scan results to identify open ports and suspicious traffic patterns.',
    challenges: 'Setting up a safe, isolated lab environment to run scans without affecting real networks. Parsing Nmap XML output reliably across different scan types.',
    decisions: 'Used Python to automate the repetitive parts of scanning and reporting, keeping the focus on understanding the results rather than running commands manually.',
    learnings: 'Gained practical experience with network security tooling and a much clearer understanding of how attackers enumerate targets. Reinforced why defence-in-depth matters.',
  },
  {
    id: 'project-4',
    slug: 'ecommerce-customer-segmentation',
    title: 'E-commerce Customer Segmentation',
    problem: 'An e-commerce business needed to understand its customer base better to improve marketing targeting and reduce wasted spend.',
    description: 'A data analysis project using Pandas and SQL to segment 5,000+ customer records by purchasing behaviour, enabling more targeted marketing strategy.',
    tech: ['Python', 'Pandas', 'SQL', 'NumPy'],
    category: 'Experiment',
    repoUrl: undefined,
    liveUrl: undefined,
    status: 'complete',
    featured: false,
    goals: [
      'Segment customers by purchasing behaviour using RFM analysis',
      'Identify high-value customer groups for targeted campaigns',
      'Produce actionable insights from raw transaction data',
    ],
    features: [
      'Data cleaning and preprocessing with Pandas',
      'SQL queries for aggregation and segmentation',
      'RFM (Recency, Frequency, Monetary) scoring',
      'Segment visualisation and summary reporting',
    ],
    architecture: 'Python-based analysis pipeline: raw CSV data loaded into Pandas, cleaned and joined with SQL queries via SQLite, then segmented using RFM scoring logic.',
    challenges: 'Handling missing and inconsistent data in the raw customer records. Deciding on meaningful segment boundaries that would actually be useful for a marketing team.',
    decisions: 'Used RFM analysis because it is interpretable and actionable — a marketing team can understand what "high recency, high frequency" means without needing a data science background.',
    learnings: 'Learned how to turn messy real-world data into something a non-technical stakeholder can act on. Also reinforced how much time data cleaning takes relative to the actual analysis.',
  },
]

// ─── Journey ──────────────────────────────────────────────────────────────────

export const journey: JourneyMilestone[] = [
  {
    id: 'j1',
    period: 'July 2022 – June 2025',
    title: 'BCA — Bachelor of Computer Applications',
    description: 'Completed my undergraduate degree at Chaudhary Devi Lal University (CDLU), Sirsa with a CGPA of 8.4/10. Built a foundation in programming, data structures, networking, and software development fundamentals.',
    tags: ['Education'],
    type: 'education',
  },
  {
    id: 'j2',
    period: 'June 2024 – October 2024',
    title: 'Web Development Intern → Team Lead',
    description: 'Joined Podosphere Technologies in Jaipur as a web development intern. Built and maintained 15+ client websites and features using React.js, WordPress, and Shopify. Implemented web security best practices including input validation and secure authentication. Promoted to team lead in the final month based on performance, and received a full-time offer.',
    tags: ['Experience', 'Leadership'],
    type: 'experience',
  },
  {
    id: 'j3',
    period: 'November 2024 – August 2025',
    title: 'Web & Tech Operations',
    description: 'Part-time role at VidiPixels in Sirsa. Handled web updating, technical asset management, software support, site performance maintenance, and troubleshooting of technical issues.',
    tags: ['Experience'],
    type: 'experience',
  },
  {
    id: 'j4',
    period: 'August 2025 – Present',
    title: 'MCA — Master of Computer Applications (Cyber Security)',
    description: 'Pursuing an online MCA specialising in Cyber Security at Lovely Professional University (LPU Online). Deepening skills in network security, secure application design, full-stack development, and system design.',
    tags: ['Education', 'Current'],
    type: 'education',
  },
  {
    id: 'j5',
    period: '2024 – Present',
    title: 'Building Projects & Learning in Public',
    description: 'Actively building projects across full-stack development and cybersecurity — Smart Career Predictor, Secure ATM Simulation, Network Traffic Analyzer, and more. Documenting the process through this site.',
    tags: ['Learning', 'Current'],
    type: 'learning',
  },
]

// ─── Blog Posts ───────────────────────────────────────────────────────────────
const demoArticleContent = {
  arrays: `## Introduction

Java arrays store a fixed number of values of one type. They are a useful first structure for learning indexing, loops, and algorithm analysis, and they still appear in production code and coding interviews.

## Creating and traversing an array

An array index starts at zero, and the final valid index is length minus one. A loop should therefore use a strict less-than comparison.

~~~java
int[] scores = {72, 91, 84, 66};
for (int index = 0; index < scores.length; index++) {
  System.out.println(index + ": " + scores[index]);
}
~~~

The array length is fixed after creation. If the collection must grow dynamically, Java's ArrayList is a more suitable choice.

## Find the maximum value

Keep a running answer while scanning each element. Initializing from the first element handles arrays containing only negative values; callers should separately decide what an empty input means.

~~~java
static int max(int[] values) {
  if (values.length == 0) {
    throw new IllegalArgumentException("values must not be empty");
  }

  int largest = values[0];
  for (int index = 1; index < values.length; index++) {
    if (values[index] > largest) {
      largest = values[index];
    }
  }
  return largest;
}
~~~

This takes O(n) time and O(1) extra space.

## Reverse an array in place

The two-pointer pattern swaps values at the ends and moves inward. Each pair is visited once, so the running time is O(n) and extra space is O(1).

~~~java
static void reverse(int[] values) {
  int left = 0;
  int right = values.length - 1;
  while (left < right) {
    int temporary = values[left];
    values[left] = values[right];
    values[right] = temporary;
    left++;
    right--;
  }
}
~~~

## Pair-sum patterns

For an unsorted array, a nested-loop solution checks each distinct pair and takes O(n squared) time. When values are sorted, two pointers can reduce that to O(n). A hash set is another common option when preserving the original order matters.

This hash-set version checks whether the complement has already appeared. Checking before inserting also ensures the same array element cannot be used twice.

~~~java
static boolean hasPairWithSum(int[] values, int target) {
  Set<Integer> seen = new HashSet<>();
  for (int value : values) {
    int complement = target - value;
    if (seen.contains(complement)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}
~~~

Import Set and HashSet from java.util. This takes O(n) expected time and O(n) additional space. Before choosing an approach, clarify whether duplicate values count as separate elements, whether the input may be empty, and whether you need the pair values or their indexes.

## Common mistakes

- Using index <= values.length and reading past the final element.
- Assuming the array's capacity can grow after creation.
- Initializing a maximum to zero when all inputs might be negative.
- Forgetting to test empty, single-element, duplicate, and already-sorted inputs.

## Conclusion

Arrays teach habits that carry into nearly every data structure: careful index reasoning, explicit edge cases, and complexity analysis. Practice traversal, two pointers, frequency counting, and prefix sums before moving to more complex structures.`,
  dryRuns: `## Introduction

A dry run is a manual trace of an algorithm using a small input. It helps confirm what each variable means and catches incorrect loop bounds before you spend time debugging a larger implementation.

## A repeatable method

1. Restate the input and expected output.
2. Choose a small example that includes an interesting case.
3. List the variables that can change.
4. Trace each loop iteration in order.
5. Compare the final state with the expected result.

## Example: find the largest array value

The algorithm starts with the first value and updates the current maximum only when a larger value is seen.

~~~java
static int maximum(int[] values) {
  if (values.length == 0) {
    throw new IllegalArgumentException("values must not be empty");
  }

  int currentMaximum = values[0];
  for (int index = 1; index < values.length; index++) {
    if (values[index] > currentMaximum) {
      currentMaximum = values[index];
    }
  }
  return currentMaximum;
}
~~~

For input [5, 2, 9, 1], the state changes as follows:

| Index | Value | Maximum before | Maximum after |
| --- | ---: | ---: | ---: |
| start | 5 | none | 5 |
| 1 | 2 | 5 | 5 |
| 2 | 9 | 5 | 9 |
| 3 | 1 | 9 | 9 |

The result is 9. A trace table makes it obvious that the first element initializes the answer and each later element is considered exactly once.

## Example: reverse with two pointers

~~~java
static void reverse(int[] values) {
  int left = 0;
  int right = values.length - 1;
  while (left < right) {
    int temporary = values[left];
    values[left] = values[right];
    values[right] = temporary;
    left++;
    right--;
  }
}
~~~

For [10, 20, 30, 40], the first swap produces [40, 20, 30, 10]. The next produces [40, 30, 20, 10]. The pointers then cross, so the loop stops. For an odd-length array, the middle value is correctly left in place.

## Choosing useful test cases

Do not only trace the usual example. Also test an empty array if the method permits it, one element, repeated values, negative values, and a case where the answer changes on the last iteration. These cases exercise assumptions that normal inputs may hide.

## Common tracing errors

- Updating the index before recording the current iteration.
- Forgetting that Java array indexes begin at zero.
- Tracking the output but not the temporary variables used by the algorithm.
- Picking an example that never exercises the important branch.

## Conclusion

Dry runs are not busywork; they are a compact way to verify logic. Once the trace is correct, translate the same steps into Java and then analyze time and space complexity.`,
  spring: `## Introduction

A small REST API is a good way to learn how HTTP requests, Java application code, and persistent data fit together. This guide uses Spring Boot, Spring Data JPA, and PostgreSQL. It focuses on a safe structure rather than a production-ready security configuration.

## Create the project and configure PostgreSQL

Add Spring Web, Spring Data JPA, and the PostgreSQL JDBC driver through Spring Initializr. Configure credentials outside source control, for example with environment-variable placeholders:

~~~properties
spring.datasource.url=\${DB_URL:jdbc:postgresql://localhost:5432/catalog}
spring.datasource.username=\${DB_USER:postgres}
spring.datasource.password=\${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
~~~

For local experimentation, a migration tool such as Flyway can create the schema. Avoid relying on automatic schema updates in production; review migrations and back up data before applying them.

## Define the persisted model

~~~java
@Entity
@Table(name = "projects")
public class Project {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String title;

  protected Project() {}

  public Project(String title) {
    this.title = title;
  }

  public Long getId() { return id; }
  public String getTitle() { return title; }
}
~~~

JPA requires a no-argument constructor. Keep input validation at the API boundary and avoid accepting persistence entities as unrestricted request payloads in a larger application; request and response DTOs provide a clearer contract.

## Add a repository and service

~~~java
public interface ProjectRepository extends JpaRepository<Project, Long> {}

@Service
public class ProjectService {
  private final ProjectRepository repository;

  public ProjectService(ProjectRepository repository) {
    this.repository = repository;
  }

  public List<Project> findAll() {
    return repository.findAll();
  }

  public Project create(String title) {
    return repository.save(new Project(title));
  }
}
~~~

The repository owns persistence operations. The service is the natural place for domain rules and transaction boundaries as behavior grows.

## Expose HTTP endpoints

~~~java
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
  private final ProjectService service;

  public ProjectController(ProjectService service) {
    this.service = service;
  }

  @GetMapping
  public List<Project> list() {
    return service.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Project create(@Valid @RequestBody CreateProjectRequest request) {
    return service.create(request.title());
  }
}

record CreateProjectRequest(@NotBlank @Size(max = 120) String title) {}
~~~

Enable Bean Validation with the validation starter and use @Valid on request bodies. Return 201 Created for successful creation, and map validation failures to useful 4xx responses.

## Test and operate the API

Test the controller with MockMvc and test repository behavior against a disposable PostgreSQL instance or a compatible test container. Keep database secrets in environment configuration, use migrations, and do not expose administrative endpoints without authentication and authorization.

## Conclusion

The controller-service-repository separation gives a beginner a clear path from HTTP to stored data. Add validation, migrations, tests, and security deliberately as the application grows; the small example is a learning foundation, not a complete production deployment.`,
  rest: `## Introduction

A REST-style API gives clients a predictable way to work with application resources over HTTP. A route identifies a resource, a method describes the requested operation, and the response includes a status code and usually a representation such as JSON.

## Resources and HTTP methods

For a project collection, a small API might expose these operations:

| Method | Route | Typical meaning |
| --- | --- | --- |
| GET | /api/projects | List projects |
| GET | /api/projects/42 | Read project 42 |
| POST | /api/projects | Create a project |
| PUT | /api/projects/42 | Replace project 42 |
| PATCH | /api/projects/42 | Partially update project 42 |
| DELETE | /api/projects/42 | Delete project 42 |

GET is safe to repeat and should not change server state. PUT replaces a representation and is generally idempotent: repeating the same request has the same intended effect. PATCH applies a partial change; its exact semantics depend on the API contract. POST commonly creates a resource and is not automatically idempotent.

## Status codes clients should understand

- 200 OK means the request succeeded and a response body is normally present.
- 201 Created means a resource was created; a Location header can identify it.
- 204 No Content means success without a response body.
- 400 Bad Request indicates malformed or invalid input.
- 401 Unauthorized means authentication is required or failed.
- 403 Forbidden means the caller is not allowed to perform the action.
- 404 Not Found means the requested resource is unavailable.
- 409 Conflict signals a conflict with current resource state, such as a duplicate slug.
- 500 Internal Server Error indicates an unexpected server failure.

## Example request and response

~~~http
POST /api/projects HTTP/1.1
Content-Type: application/json

{"title":"Reading tracker"}
~~~

A successful response could use 201 Created and return a representation:

~~~json
{
  "id": 42,
  "title": "Reading tracker"
}
~~~

Clients should check the status code before assuming a response is successful, and servers should return consistent error shapes without leaking stack traces or secrets.

## Design a predictable contract

Use nouns for resource routes, validate incoming data, and keep response shapes consistent. Document whether a field is optional, what happens for missing resources, and whether an update replaces or merges values. Pagination and filtering should be explicit for collections that can grow.

## Common mistakes

- Using POST for every operation instead of selecting the method that matches the behavior.
- Returning 200 for every outcome, including validation failures.
- Confusing 401 (authentication) with 403 (authorization).
- Returning private database or exception details in error responses.

## Conclusion

HTTP methods and status codes form a compact vocabulary for API behavior. A consistent contract makes a service easier to test, operate, and consume from browsers, mobile apps, and other services.`,
  journey: `## Introduction

This demo article is an honest learning roadmap, not a claim about unrecorded personal events. The profile on this site lists a Bachelor of Computer Applications foundation and an ongoing interest in Java, web development, and full-stack software. The practical lesson is that those areas reinforce one another when studied through small, verifiable projects.

## Start with Java fundamentals

Learn variables, methods, classes, collections, exceptions, and basic input/output. Then practice data structures and algorithms with small problems. Arrays are particularly useful because they make indexes, loops, and complexity visible.

~~~java
static int sum(int[] values) {
  int total = 0;
  for (int value : values) {
    total += value;
  }
  return total;
}
~~~

For each exercise, test an ordinary case and an edge case, explain the time complexity, and keep the solution understandable before optimizing it.

## Connect the browser to an API

Full-stack work becomes easier when each layer has a clear responsibility. A browser presents the interface, an API validates and processes requests, and a database persists records. Learn HTTP methods and status codes, then build a small feature end to end rather than collecting disconnected tutorials.

~~~javascript
const response = await fetch('/api/projects');
if (!response.ok) {
  throw new Error("Request failed: " + response.status);
}
const projects = await response.json();
~~~

The client must handle loading, empty, success, and error states. The server must validate input and avoid returning private data.

## Build a portfolio project in increments

Choose one small problem, write down the user and the expected behavior, and divide the work into a few vertical slices. Each slice should be testable from the interface through the API to storage. Use version control, readable commits, and a short README that explains setup and limitations.

## Keep learning evidence-based

For a real personal journey article, replace this demo with dates, projects, and lessons you can verify. Avoid inflating scope: distinguish what is complete from what is in progress, and describe technical decisions rather than claiming outcomes that cannot be supported.

## Conclusion

Java fundamentals and full-stack development are not competing tracks. Strong fundamentals make frontend and backend decisions easier, while projects reveal which concepts need more practice. Keep the loop small: learn a concept, build something observable, test it, and record what is genuinely known.`,
}

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'java-arrays-concepts-examples-dsa-problems',
    title: 'Java Arrays: Concepts, Examples and Important DSA Problems',
    description:
      'A practical guide to Java arrays, indexing, traversal, and the common problem patterns beginners encounter when learning DSA.',
    seoTitle: 'Java Arrays: Concepts, Examples and Important DSA Problems | Prince Monga',
    category: 'Java & DSA',
    tags: ['Java', 'Arrays', 'DSA', 'Interview Practice'],
    excerpt:
      'Arrays are one of the first data structures you meet in Java, and they are still incredibly useful for problem-solving, interview preparation, and building efficient algorithms.',
  content: demoArticleContent.arrays,
    date: '2026-10-09',
    status: 'published',
    readingTimeMinutes: Math.max(1, Math.ceil(demoArticleContent.arrays.trim().split(/\s+/).length / 200)),
    related: ['solve-array-problems-dry-runs-java', 'rest-api-http-methods-status-codes-examples'],
    isDemo: true,
  },
  {
    id: 'b2',
    slug: 'solve-array-problems-dry-runs-java',
    title: 'How to Solve Array Problems Using Dry Runs in Java',
    description:
      'A beginner-friendly method for solving array problems by tracing values, indexes, and state changes step by step before writing the final Java solution.',
    seoTitle: 'How to Solve Array Problems Using Dry Runs in Java | Prince Monga',
    category: 'Java & DSA',
    tags: ['Java', 'Arrays', 'Problem Solving', 'Dry Run'],
    excerpt:
      'Dry runs help you understand what the code is really doing before you optimize it. They are often the difference between guessing and solving.',
    content: demoArticleContent.dryRuns,
    date: '2026-10-09',
    status: 'published',
    readingTimeMinutes: Math.max(1, Math.ceil(demoArticleContent.dryRuns.trim().split(/\s+/).length / 200)),
    related: ['java-arrays-concepts-examples-dsa-problems', 'rest-api-http-methods-status-codes-examples'],
    isDemo: true,
  },
  {
    id: 'b3',
    slug: 'spring-boot-rest-api-postgresql-beginners-guide',
    title: 'Spring Boot REST API with PostgreSQL: A Beginner’s Guide',
    description:
      'A practical guide to creating a Spring Boot REST API backed by PostgreSQL, with entities, repositories, controllers, and a real project structure.',
    seoTitle: 'Spring Boot REST API with PostgreSQL: A Beginner’s Guide | Prince Monga',
    category: 'Backend Development',
    tags: ['Spring Boot', 'Java', 'REST API', 'PostgreSQL'],
    excerpt:
      'Spring Boot makes Java backend development more approachable, and PostgreSQL gives you a reliable database for real application data.',
    content: demoArticleContent.spring,
    date: '2026-10-09',
    status: 'published',
    readingTimeMinutes: Math.max(1, Math.ceil(demoArticleContent.spring.trim().split(/\s+/).length / 200)),
    related: ['rest-api-http-methods-status-codes-examples', 'java-arrays-concepts-examples-dsa-problems'],
    isDemo: true,
  },
  {
    id: 'b4',
    slug: 'rest-api-http-methods-status-codes-examples',
    title: 'REST API Explained: HTTP Methods, Status Codes and Examples',
    description:
      'A clear beginner-friendly explanation of REST APIs, the most common HTTP methods, and the status codes you will encounter in real application work.',
    seoTitle: 'REST API Explained: HTTP Methods, Status Codes and Examples | Prince Monga',
    category: 'Backend Development',
    tags: ['REST API', 'HTTP', 'Web Development', 'Backend'],
    excerpt:
      'REST APIs are the language of modern web applications. Understanding the HTTP methods and response codes makes backend design much easier.',
    content: demoArticleContent.rest,
    date: '2026-10-09',
    status: 'published',
    readingTimeMinutes: Math.max(1, Math.ceil(demoArticleContent.rest.trim().split(/\s+/).length / 200)),
    related: ['spring-boot-rest-api-postgresql-beginners-guide', 'java-arrays-concepts-examples-dsa-problems'],
    isDemo: true,
  },
  {
    id: 'b5',
    slug: 'developer-journey-java-full-stack',
    title: 'My Developer Journey: Learning Java and Full-Stack Development',
    description:
      'A practical reflection on building a developer foundation with BCA studies, hands-on work, and ongoing full-stack learning in public.',
    seoTitle: 'My Developer Journey: Learning Java and Full-Stack Development | Prince Monga',
    category: 'Learning & Reflection',
    tags: ['Career', 'Learning', 'Full Stack', 'JavaScript'],
    excerpt:
      'Real growth in software development usually comes from combining formal study, hands-on work, and the habit of documenting what you learn as you go.',
    content: demoArticleContent.journey,
    date: '2026-10-09',
    status: 'published',
    readingTimeMinutes: Math.max(1, Math.ceil(demoArticleContent.journey.trim().split(/\s+/).length / 200)),
    related: ['java-arrays-concepts-examples-dsa-problems', 'spring-boot-rest-api-postgresql-beginners-guide'],
    isDemo: true,
  },
]

// Legacy shape used by homepage LatestWriting component
export const articles: Article[] = blogPosts
  .filter(p => contentSettings.demoMode || !p.isDemo)
  .map(p => ({
  id: p.id,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  date: p.date,
  slug: p.slug,
  status: p.status === 'published' ? 'published' : 'placeholder',
  }))

// ─── Services ─────────────────────────────────────────────────────────────────

export const services: Service[] = [
  {
    id: 's1',
    title: 'Business Websites',
    description: 'Clean, fast, and accessible websites for small businesses — built with React, WordPress, or Shopify depending on what fits best.',
    icon: 'Globe',
    details: [
      'Responsive, mobile-first design',
      'React, WordPress, or Shopify',
      'Performance and accessibility focused',
      'SEO foundations built in',
    ],
  },
  {
    id: 's2',
    title: 'Frontend Development',
    description: 'Component-based UI development with React and JavaScript. Focused on usability, responsiveness, and maintainable code.',
    icon: 'Layout',
    details: [
      'React.js and JavaScript',
      'Reusable component systems',
      'Accessible UI patterns',
      'Clean, maintainable code',
    ],
  },
  {
    id: 's3',
    title: 'REST API Development',
    description: 'Backend APIs built with Node.js/Express or Flask, designed around clear contracts and practical data models.',
    icon: 'Server',
    details: [
      'Node.js/Express or Python/Flask',
      'MySQL and PostgreSQL databases',
      'Clear API design',
      'Practical data modelling',
    ],
  },
  {
    id: 's4',
    title: 'Website Improvements',
    description: 'Performance audits, security hardening, accessibility fixes, and incremental improvements to existing web projects.',
    icon: 'Wrench',
    details: [
      'Performance and security audits',
      'Accessibility improvements',
      'Code refactoring',
      'Bug fixes and maintenance',
    ],
  },
]

// ─── Journal Entries ──────────────────────────────────────────────────────────
// Starter content kept as non-public sample entries until the site owner decides to publish them.
export const journalEntries: JournalEntry[] = [
  {
    id: 'je1',
    date: '2026-10-01',
    title: 'Java array practice and dry runs',
    worked_on: 'Worked through a set of simple array problems in Java, focusing on maximum values, reverse logic, and duplicate handling. Repeated the same patterns to build confidence with loops and indices.',
    learned: 'Dry runs are still the fastest way to catch off-by-one mistakes. Writing out the state of the loop and the current index makes the logic much clearer.',
    challenges: 'I initially treated array problems as memorization exercises, but I realized I needed to understand the step-by-step flow instead of just copying patterns.',
    next_steps: 'Continue with medium-level array problems and convert each solution into short notes about time complexity and edge cases.',
    mood: 'good',
    tags: ['java', 'dsa', 'arrays'],
    isSample: true,
  },
  {
    id: 'je2',
    date: '2026-10-03',
    title: 'Array problem solving in Java',
    worked_on: 'Solved a few beginner-friendly array problems using brute force and then refactored the logic to reduce unnecessary comparisons. Paid close attention to loop boundaries and repeated conditions.',
    learned: 'The simplest working approach is often easier to reason about before optimization. Once the logic is correct, complexity improvements become much easier to understand.',
    challenges: 'It was easy to mix index and value logic when reviewing a previous solution. I corrected that by writing small trace tables for the loop state.',
    next_steps: 'Try one pair-sum and one rotation problem next, and compare the different approaches against the same constraints.',
    mood: 'good',
    tags: ['java', 'problem-solving'],
    isSample: true,
  },
  {
    id: 'je3',
    date: '2026-10-05',
    title: 'Spring Boot API structure',
    worked_on: 'Reviewed the project structure for a small Spring Boot application, focusing on controller, service, repository, and entity separation. Map out how requests flow through the app before writing new endpoints.',
    learned: 'Keeping the API layers separated makes the code easier to test and extend. Controllers should stay thin while service logic stays focused on behavior.',
    challenges: 'It was easy to mix database logic directly into the controller while prototyping. I corrected that by clarifying responsibilities before adding more routes.',
    next_steps: 'Create a minimal CRUD project, add validation, and document the request/response structure for future reference.',
    mood: 'good',
    tags: ['spring-boot', 'backend'],
    isSample: true,
  },
  {
    id: 'je4',
    date: '2026-10-07',
    title: 'PostgreSQL and data modeling basics',
    worked_on: 'Reviewed the basics of tables, primary keys, and relational design, then applied them to a simple project schema. Focused on how data should be organized before writing application code.',
    learned: 'A clear schema saves time later because it reduces ambiguity in the API design. It is much easier to build consistent features when the core data model is simple and intentional.',
    challenges: 'Thinking in terms of relationships rather than just rows took adjustment. Once the structure was mapped out, the API design felt more natural.',
    next_steps: 'Continue with one-to-many examples and compare those patterns with the way a real app stores project and journal data.',
    mood: 'okay',
    tags: ['postgresql', 'database'],
    isSample: true,
  },
  {
    id: 'je5',
    date: '2026-10-09',
    title: 'Project structure and code quality review',
    worked_on: 'Reviewed the layout of a small full-stack project and clarified which pieces belong in the frontend, backend, and shared logic. Identified a few places where naming and separation could be improved.',
    learned: 'Good project structure reduces confusion during future changes. A little organization upfront saves time when debugging or adding new features.',
    challenges: 'The hardest part was resisting the urge to add unnecessary complexity simply because a feature looked small. Simpler structure is usually more sustainable.',
    next_steps: 'Document a reusable project checklist for architecture, naming, validation, and testing so the next build starts with a clearer structure.',
    mood: 'good',
    tags: ['full-stack', 'architecture', 'quality'],
    isSample: true,
  },
]

// ─── Streak / Activity Data ───────────────────────────────────────────────────
// Real public streaks are generated from published journal entries only.
export const streakData: StreakDay[] = []

// Standalone preview records; they are never written to or merged with journal data.
function buildDemoActivity(timeZone: string): StreakDay[] {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = Number(parts.find(part => part.type === 'year')?.value)
  const month = Number(parts.find(part => part.type === 'month')?.value)
  const dayOfMonth = Number(parts.find(part => part.type === 'day')?.value)

  return Array.from({ length: 365 }, (_, offset) => {
    const date = new Date(Date.UTC(year, month - 1, dayOfMonth - 364 + offset))
    const iso = date.toISOString().slice(0, 10)
    let seed = date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate()
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b)
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b)
    const sample = (seed ^ (seed >>> 16)) >>> 0
    const level: StreakDay['level'] = sample % 100 < 48 ? 0 : sample % 100 < 70 ? 1 : sample % 100 < 86 ? 2 : sample % 100 < 96 ? 3 : 4
    return { date: iso, level, note: 'Sample preview activity', isSample: true }
  })
}

export const demoStreakData = buildDemoActivity(contentSettings.timeZone)

// ─── Blog categories ─────────────────────────────────────────────────────────

export const blogCategories = [
  'All',
  'Networking & Security',
  'Backend Development',
  'React & Frontend',
  'JavaScript',
  'Java',
  'Databases',
  'Career',
  'Learning & Reflection',
  'Personal Journey',
]

// ─── Project categories ───────────────────────────────────────────────────────

export const projectCategories = ['All', 'Full Stack', 'Frontend', 'Backend', 'Experiment'] as const
