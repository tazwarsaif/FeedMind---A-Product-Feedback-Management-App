import React from "react";

export default function Footer() {
    return (
        <footer className="footer footer-center p-10 bg-green-700 text-white">
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-6 p-10 mb-5">
                <div className="text-left flex justify-center gap-3 text-wrap">
                    <span className="footer-title">Services</span>
                    <a className="link link-hover">Branding</a>
                    <a className="link link-hover">Design</a>
                    <a className="link link-hover">Marketing</a>
                    <a className="link link-hover">Advertisement</a>
                </div>
                <div className="text-left flex justify-center gap-3 text-wrap">
                    <span className="footer-title">Company</span>
                    <a className="link link-hover">About us</a>
                    <a className="link link-hover">Contact</a>
                    <a className="link link-hover">Jobs</a>
                    <a className="link link-hover">Press kit</a>
                </div>
                <div className="text-left flex justify-center gap-3 text-wrap">
                    <span className="footer-title">Legal</span>
                    <a className="link link-hover">Terms of use</a>
                    <a className="link link-hover">Privacy policy</a>
                    <a className="link link-hover">Cookie policy</a>
                </div>
                <div className="text-left flex justify-center gap-3 text-wrap">
                    <span className="footer-title">Social</span>
                    <a className="link link-hover">Twitter</a>
                    <a className="link link-hover">YouTube</a>
                    <a className="link link-hover">Facebook</a>
                </div>
            </div>
        </footer>
    );
}
