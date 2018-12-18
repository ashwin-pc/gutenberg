/**
 * Internal dependencies
 */
import { HOSTS_NO_PREVIEWS } from './constants';
import { getPhotoHtml } from './util';

/**
 * External dependencies
 */
import { parse } from 'url';
import { includes } from 'lodash';
import classnames from 'classnames/dedupe';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Placeholder, SandBox } from '@wordpress/components';
import { RichText, BlockIcon } from '@wordpress/editor';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import WpEmbedPreview from './wp-embed-preview';

const EmbedPreview = class extends Component {
	constructor() {
		super( ...arguments );
		this.hideOverlay = this.hideOverlay.bind( this );
		this.state = {
			interactve: false,
		};
	}

	hideOverlay() {
		// This is called onMouseUp on the overlay. We can't respond to the `isSelected` prop
		// changing, because that happens on mouse down, and the overlay immediately disappears,
		// and the mouse event can end up in the preview content. We can't use onClick on
		// the overlay to hide it either, because then Gutenberg misses the mouseup event, and
		// thinks we're multi-selecting blocks.
		this.setState( { interactive: true } );
	}

	static getDerivedStateFromProps( nextProps ) {
		if ( ! nextProps.isSelected ) {
			// We only want to change this when the block is not selected, because changing it when
			// the block becomes selected makes the overlap disappear too early. Hiding the overlay
			// happens on mouseup when the overlay is clicked.
			return { interactive: false };
		}
	}

	render() {
		const { preview, url, type, caption, onCaptionChange, isSelected, className, icon, label } = this.props;
		const { scripts } = preview;
		const { interactive } = this.state;

		const html = 'photo' === type ? getPhotoHtml( preview ) : preview.html;
		const parsedUrl = parse( url );
		const cannotPreview = includes( HOSTS_NO_PREVIEWS, parsedUrl.host.replace( /^www\./, '' ) );
		// translators: %s: host providing embed content e.g: www.youtube.com
		const iframeTitle = sprintf( __( 'Embedded content from %s' ), parsedUrl.host );
		const sandboxClassnames = classnames( type, className, 'wp-block-embed__wrapper' );

		/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
		const embedWrapper = 'wp-embed' === type ? (
			<WpEmbedPreview
				html={ html }
			/>
		) : (
			<div className="wp-block-embed__wrapper">
				<SandBox
					html={ html }
					scripts={ scripts }
					title={ iframeTitle }
					type={ sandboxClassnames }
				/>
				{ ! interactive && <div
					role="dialog"
					className="wp-block-embed-interactive-overlay"
					onMouseUp={ this.hideOverlay } /> }
			</div>
		);
		/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */

		return (
			<figure className={ classnames( className, 'wp-block-embed', { 'is-type-video': 'video' === type } ) }>
				{ ( cannotPreview ) ? (
					<Placeholder icon={ <BlockIcon icon={ icon } showColors /> } label={ label }>
						<p className="components-placeholder__error"><a href={ url }>{ url }</a></p>
						<p className="components-placeholder__error">{ __( 'Sorry, we cannot preview this embedded content in the editor.' ) }</p>
					</Placeholder>
				) : embedWrapper }
				{ ( ! RichText.isEmpty( caption ) || isSelected ) && (
					<RichText
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						onChange={ onCaptionChange }
						inlineToolbar
					/>
				) }
			</figure>
		);
	}
};

export default EmbedPreview;
