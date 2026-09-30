import "./GovtFooter.css";

export default function GovtFooter() {
    return (
        <footer className="govt-footer">
            <div className="govt-footer-top">
                <div className="govt-footer-brand">
                    <div className="govt-emblem-badge">
                        <span className="emblem-symbol"></span>
                        <div>
                            <h3>NexVerify AI Procurement Verification Platform</h3>
                            <p>CPCL Digital Public Infrastructure · MoPNG, Government of India</p>
                        </div>
                    </div>
                    <p className="govt-desc">
                        An AI-powered automated bid evaluation and statutory cross-verification engine designed for seamless compliance verification across GSTN, MCA21, CBDT, EPFO, ESIC, and Central Debarment Registries.
                    </p>
                </div>

                <div className="govt-footer-links">
                    <div className="link-group">
                        <h4>Government Portals</h4>
                        <ul>
                            <li><a href="https://gem.gov.in" target="_blank" rel="noreferrer">GeM Portal (gem.gov.in)</a></li>
                            <li><a href="https://eprocure.gov.in" target="_blank" rel="noreferrer">CPPP Portal (eprocure.gov.in)</a></li>
                            <li><a href="https://gst.gov.in" target="_blank" rel="noreferrer">GSTN Portal (gst.gov.in)</a></li>
                            <li><a href="https://incometax.gov.in" target="_blank" rel="noreferrer">e-Filing CBDT (incometax.gov.in)</a></li>
                        </ul>
                    </div>

                    <div className="link-group">
                        <h4>Compliance & Policies</h4>
                        <ul>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Hyperlinking Policy</a></li>
                            <li><a href="#copyright">Copyright Policy</a></li>
                            <li><a href="#gigw">GIGW Accessibility Statement</a></li>
                        </ul>
                    </div>

                    <div className="link-group">
                        <h4>Support & Helpdesk</h4>
                        <ul>
                            <li><strong>Toll Free:</strong> 1800-11-2026</li>
                            <li><strong>Helpdesk:</strong> support-nexverify@cpcl.gov.in</li>
                            <li><strong>Working Hours:</strong> Mon-Fri 09:00 AM - 06:00 PM IST</li>
                            <li><strong>Security Incident:</strong> cert-in@nic.in</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="govt-footer-bottom">
                <div className="govt-cert-badges">
                    <span className="cert-tag"> Digital India</span>
                    <span className="cert-tag"> ISO 27001 Certified</span>
                    <span className="cert-tag"> STQC Audit Cleared</span>
                    <span className="cert-tag"> GIGW Level AA Compliant</span>
                </div>

                <div className="govt-copyright">
                    <p> 2026 Chennai Petroleum Corporation Limited (CPCL) & Ministry of Petroleum and Natural Gas. All Rights Reserved.</p>
                    <p className="nic-tag">Designed & Developed for Smart India Hackathon (SIH PS 26100)</p>
                </div>
            </div>
        </footer>
    );
}
