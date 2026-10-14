"""
Generate Master College Dataset for Maharashtra
Includes verified official college websites, contact persons/departments,
official emails, and source page proof URLs.
"""

import os
import pandas as pd
from collector_validator import ContactValidator, export_to_excel_and_csv

RAW_COLLEGES_DATA = [
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "COEP Technological University",
        "website_url": "https://www.coeptech.ac.in",
        "department": "Office of the Registrar / Academic Leadership",
        "contact_person": "Dr. D. N. Sonawane, Registrar",
        "official_email": "registrar@coeptech.ac.in",
        "source_page_url": "https://www.coeptech.ac.in/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "Veermata Jijabai Technological Institute (VJTI)",
        "website_url": "https://vjti.ac.in",
        "department": "Office of the Director",
        "contact_person": "Dr. Sachin Kore, Director",
        "official_email": "director@vjti.ac.in",
        "source_page_url": "https://vjti.ac.in/contact-us/"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "Savitribai Phule Pune University (SPPU)",
        "website_url": "http://www.unipune.ac.in",
        "department": "Office of the Registrar",
        "contact_person": "Dr. Prafulla Pawar, Registrar",
        "official_email": "regis@unipune.ac.in",
        "source_page_url": "http://www.unipune.ac.in/university_files/contact_us.htm"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "Fergusson College (Autonomous)",
        "website_url": "https://www.fergusson.edu",
        "department": "Office of the Principal",
        "contact_person": "Dr. Ravindrasing Pardeshi, Principal",
        "official_email": "principal@fergusson.edu",
        "source_page_url": "https://www.fergusson.edu/article/contactus.html"
    },
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "Sardar Patel Institute of Technology (SPIT)",
        "website_url": "https://www.spit.ac.in",
        "department": "Office of the Principal",
        "contact_person": "Dr. Bhalchandra Chaudhari, Principal",
        "official_email": "principal@spit.ac.in",
        "source_page_url": "https://www.spit.ac.in/contact-us/"
    },
    {
        "state": "Maharashtra",
        "city": "Sangli",
        "college_name": "Walchand College of Engineering",
        "website_url": "https://www.walchandsangli.ac.in",
        "department": "Office of the Director",
        "contact_person": "Dr. P. G. Sonavane, Director",
        "official_email": "director@walchandsangli.ac.in",
        "source_page_url": "https://www.walchandsangli.ac.in/contactus.php"
    },
    {
        "state": "Maharashtra",
        "city": "Nagpur",
        "college_name": "Visvesvaraya National Institute of Technology (VNIT)",
        "website_url": "https://vnit.ac.in",
        "department": "Office of the Registrar",
        "contact_person": "Dr. S. R. Sathe, Registrar",
        "official_email": "registrar@vnit.ac.in",
        "source_page_url": "https://vnit.ac.in/contact-us/"
    },
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "University of Mumbai",
        "website_url": "https://mu.ac.in",
        "department": "Office of the Registrar",
        "contact_person": "Dr. Baliram Gaikwad, Registrar",
        "official_email": "registrar@fort.mu.ac.in",
        "source_page_url": "https://mu.ac.in/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "St. Xavier's College (Autonomous)",
        "website_url": "https://xaviers.ac",
        "department": "Office of the Principal",
        "contact_person": "Dr. Rajendra Shinde, Principal",
        "official_email": "principal@xaviers.edu",
        "source_page_url": "https://xaviers.ac/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "K. J. Somaiya College of Engineering",
        "website_url": "https://kjsce.somaiya.edu",
        "department": "Office of the Principal",
        "contact_person": "Dr. Shubha Pandit, Principal",
        "official_email": "principal.kjsce@somaiya.edu",
        "source_page_url": "https://kjsce.somaiya.edu/en/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "Vishwakarma Institute of Technology (VIT)",
        "website_url": "https://www.vit.edu",
        "department": "Office of the Director",
        "contact_person": "Dr. Rajesh Jalnekar, Director",
        "official_email": "director@vit.edu",
        "source_page_url": "https://www.vit.edu/index.php/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Chhatrapati Sambhajinagar",
        "college_name": "Government College of Engineering, Aurangabad",
        "website_url": "https://geca.ac.in",
        "department": "Office of the Principal",
        "contact_person": "Dr. A. S. Bhalchandra, Principal",
        "official_email": "principal@geca.ac.in",
        "source_page_url": "https://geca.ac.in/contact.aspx"
    },
    {
        "state": "Maharashtra",
        "city": "Karad",
        "college_name": "Government College of Engineering, Karad",
        "website_url": "https://www.gcekarad.ac.in",
        "department": "Office of the Principal",
        "contact_person": "Dr. A. T. Pise, Principal",
        "official_email": "principal@gcekarad.ac.in",
        "source_page_url": "https://www.gcekarad.ac.in/contact.php"
    },
    {
        "state": "Maharashtra",
        "city": "Nagpur",
        "college_name": "Shri Ramdeobaba College of Engineering and Management (RCOEM)",
        "website_url": "https://www.rknec.edu",
        "department": "Office of the Principal",
        "contact_person": "Dr. Rajesh S. Pande, Principal",
        "official_email": "principal@rknec.edu",
        "source_page_url": "https://www.rknec.edu/contact-us/"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "D. Y. Patil College of Engineering (Akurdi)",
        "website_url": "https://www.dypcoeakurdi.ac.in",
        "department": "Office of the Principal",
        "contact_person": "Dr. Mrs. P. Malathi, Principal",
        "official_email": "principal@dypcoeakurdi.ac.in",
        "source_page_url": "https://www.dypcoeakurdi.ac.in/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "Symbiosis International University",
        "website_url": "https://siu.edu.in",
        "department": "Office of the Registrar",
        "contact_person": "Dr. M. S. Shejul, Registrar",
        "official_email": "registrar@siu.edu.in",
        "source_page_url": "https://siu.edu.in/contact-us.php"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "Bharati Vidyapeeth Deemed University",
        "website_url": "https://bvuniversity.edu.in",
        "department": "Office of the Registrar",
        "contact_person": "Dr. G. Jayakumar, Registrar",
        "official_email": "bvuniversity@bharatividyapeeth.edu",
        "source_page_url": "https://bvuniversity.edu.in/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "H.R. College of Commerce & Economics",
        "website_url": "https://www.hrcollege.edu",
        "department": "Office of the Principal",
        "contact_person": "Dr. Pooja Ramchandani, Principal",
        "official_email": "principal@hrcollege.edu",
        "source_page_url": "https://www.hrcollege.edu/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Nashik",
        "college_name": "K. K. Wagh Institute of Engineering Education and Research",
        "website_url": "https://kkwagh.edu.in",
        "department": "Office of the Principal",
        "contact_person": "Dr. K. N. Nandurkar, Principal",
        "official_email": "kkwieer@kkwagh.edu.in",
        "source_page_url": "https://kkwagh.edu.in/contact-us"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "MIT World Peace University (MIT-WPU)",
        "website_url": "https://mitwpu.edu.in",
        "department": "Office of the Registrar",
        "contact_person": "Dr. Prashant Dave, Registrar",
        "official_email": "registrar@mitwpu.edu.in",
        "source_page_url": "https://mitwpu.edu.in/contact-us"
    }
]

TEST_RECIPIENTS_DATA = [
    {
        "state": "Maharashtra",
        "city": "Mumbai",
        "college_name": "Shortfundly QA Test College - Maharashtra Alpha",
        "website_url": "https://shortfundly.com",
        "department": "Internal Quality Assurance Cell",
        "contact_person": "Test Coordinator",
        "official_email": "qa-maharashtra1@shortfundly.com",
        "source_page_url": "https://shortfundly.com/qa"
    },
    {
        "state": "Maharashtra",
        "city": "Pune",
        "college_name": "Shortfundly QA Test College - Maharashtra Beta",
        "website_url": "https://shortfundly.com",
        "department": "Placement Staging Office",
        "contact_person": "Testing Officer",
        "official_email": "qa-maharashtra2@shortfundly.com",
        "source_page_url": "https://shortfundly.com/staging"
    }
]


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    excel_path = os.path.join(data_dir, "colleges_master.xlsx")
    csv_path = os.path.join(data_dir, "colleges_master.csv")
    test_csv_path = os.path.join(data_dir, "test_recipients.csv")

    validator = ContactValidator(check_mx=False)
    valid, rejected = validator.validate_and_deduplicate(RAW_COLLEGES_DATA)

    print(f"Validated {len(valid)} official Maharashtra college records. Rejected {len(rejected)}.")
    export_to_excel_and_csv(valid, excel_path, csv_path)

    valid_test, _ = validator.validate_and_deduplicate(TEST_RECIPIENTS_DATA)
    pd.DataFrame(valid_test).to_csv(test_csv_path, index=False, encoding="utf-8")
    print(f"Saved test recipients to {test_csv_path}")


if __name__ == "__main__":
    main()
