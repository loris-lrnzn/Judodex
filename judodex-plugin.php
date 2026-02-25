<?php
/*
* Plugin Name: Judodex Plugin
*/

// Bloc pour la gestion d'ACF (tel que tu l'as fourni)
if (! function_exists('is_plugin_active')) {
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
}

if (is_plugin_active('advanced-custom-fields-pro/acf.php')) {
    return;
}

if (defined('MY_ACF_PATH')) {
    return;
}

define('MY_ACF_PATH', __DIR__ . '/vendor/acf/');
define(
    'MY_ACF_URL',
    plugin_dir_url(__FILE__) . 'vendor/acf/'
);

include_once(MY_ACF_PATH . 'acf.php');

add_filter('acf/settings/url', 'my_acf_settings_url');
function my_acf_settings_url($url)
{
    return MY_ACF_URL;
}

if (is_plugin_active('advanced-custom-fields/acf.php')) {
    add_action('admin_notices', function () {
?>
        <div class="updated" style="border-left: 4px solid #ffba00;">
            <p>The ACF plugin cannot be activated at the same time as Third-Party Product and has been deactivated. Please keep ACF installed to allow you to use ACF functionality.</p>
        </div>
<?php
    }, 99);

    deactivate_plugins('advanced-custom-fields/acf.php');
}

// Inclure Judodex-model file
include_once(__DIR__ . '/model/judodex-model.php');


// Enregistrement des routes de l'API REST
add_action('rest_api_init', function () {
    // Route pour toutes les techniques, avec support des paramètres de recherche et filtrage
    register_rest_route('judodex/v1', '/techniques', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_techniques',
        'permission_callback' => '__return_true',
        'args' => array( // Déclaration des arguments attendus
            'search' => array(
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => function ($param) {
                    return is_string($param);
                },
            ),
            'position' => array(
                'type'              => 'array',
                'items'             => ['type' => 'string'],
                'sanitize_callback' => null,
                'validate_callback' => function ($param) {
                    return is_string($param) || is_array($param);
                },
            ),
            'ceinture' => array(
                'type'              => 'array',
                'items'             => ['type' => 'string'],
                'sanitize_callback' => null,
                'validate_callback' => function ($param) {
                    return is_string($param) || is_array($param);
                },
            ),
            'type' => array(
                'type'              => 'array',
                'items'             => ['type' => 'string'],
                'sanitize_callback' => null,
                'validate_callback' => function ($param) {
                    return is_string($param) || is_array($param);
                },
            ),
            'mouvement' => array(
                'type'              => 'array',
                'items'             => ['type' => 'string'],
                'sanitize_callback' => null,
                'validate_callback' => function ($param) {
                    return is_string($param) || is_array($param);
                },
            ),
            'direction' => array(
                'type'              => 'array',
                'items'             => ['type' => 'string'],
                'sanitize_callback' => null,
                'validate_callback' => function ($param) {
                    return is_string($param) || is_array($param);
                },
            ),
        ),
    ));

    // Route pour une technique spécifique par ID
    register_rest_route('judodex/v1', '/techniques/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_technique_by_id',
        'permission_callback' => '__return_true',
        'args'                => array(
            'id' => array(
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                }
            ),
        ),
    ));

    // Route pour récupérer toutes les positions uniques
    register_rest_route('judodex/v1', '/positions', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_positions',
        'permission_callback' => '__return_true',
    ));

    // Route pour récupérer toutes les ceintures uniques
    register_rest_route('judodex/v1', '/ceintures', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_ceintures',
        'permission_callback' => '__return_true',
    ));

    // Route pour récupérer tous les types uniques
    register_rest_route('judodex/v1', '/types', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_types',
        'permission_callback' => '__return_true',
    ));

    // Route pour récupérer tous les mouvements uniques
    register_rest_route('judodex/v1', '/mouvements', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_mouvements',
        'permission_callback' => '__return_true',
    ));

    // Route pour récupérer toutes les directions uniques
    register_rest_route('judodex/v1', '/directions', array(
        'methods'             => 'GET',
        'callback'            => 'get_judodex_directions',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Fonction de callback pour récupérer toutes les techniques du Judodex, avec support de filtrage.
 *
 * @param WP_REST_Request $request L'objet requête contenant les paramètres de filtrage.
 * @return WP_REST_Response
 */
function get_judodex_techniques($request)
{
    $args = array(
        'post_type'      => 'technique-de-judo', // Assure-toi que c'est le bon 'post_type'
        'posts_per_page' => -1, // -1 pour obtenir toutes les techniques qui correspondent aux filtres
        'post_status'    => 'publish',
    );

    // 1. Filtrage par recherche (paramètre 's' pour WP_Query)
    $search_query = $request->get_param('search');
    if (! empty($search_query)) {
        $args['s'] = $search_query;
    }

    // 2. Filtrage par taxonomie 'position'
    $selected_positions = $request->get_param('position');
    if (! empty($selected_positions)) {
        if (! is_array($selected_positions)) {
            $selected_positions = array($selected_positions);
        }
        if (! isset($args['tax_query'])) {
            $args['tax_query'] = array();
        }
        $args['tax_query'][] = array(
            'taxonomy' => 'position', // Slug de ta taxonomie
            'field'    => 'slug',     // Filtrer par le slug du terme
            'terms'    => $selected_positions,
            'operator' => 'IN',
        );
    }

    // 3. Filtrage par champ ACF 'ceinture' (via meta_query)
    $selected_ceintures = $request->get_param('ceinture');
    if (! empty($selected_ceintures)) {
        if (! is_array($selected_ceintures)) {
            $selected_ceintures = array($selected_ceintures);
        }
        if (! isset($args['meta_query'])) {
            $args['meta_query'] = array();
        }
        $args['meta_query'][] = array(
            'key'     => 'ceinture',
            'value'   => $selected_ceintures,
            'compare' => 'IN',
        );
    }

    // 4. Filtrage par champ ACF 'type' (via meta_query)
    $selected_types = $request->get_param('type');
    if (! empty($selected_types)) {
        if (! is_array($selected_types)) {
            $selected_types = array($selected_types);
        }
        if (! isset($args['meta_query'])) {
            $args['meta_query'] = array();
        }
        $args['meta_query'][] = array(
            'key'     => 'type',
            'value'   => $selected_types,
            'compare' => 'IN',
        );
    }

    // 5. Filtrage par champ ACF 'mouvement' (via meta_query)
    $selected_mouvements = $request->get_param('mouvement');
    if (! empty($selected_mouvements)) {
        if (! is_array($selected_mouvements)) {
            $selected_mouvements = array($selected_mouvements);
        }
        if (! isset($args['meta_query'])) {
            $args['meta_query'] = array();
        }
        $args['meta_query'][] = array(
            'key'     => 'mouvement',
            'value'   => $selected_mouvements,
            'compare' => 'IN',
        );
    }

    // 6. Filtrage par champ ACF 'direction' (via meta_query)
    $selected_directions = $request->get_param('direction');
    if (! empty($selected_directions)) {
        if (! is_array($selected_directions)) {
            $selected_directions = array($selected_directions);
        }
        if (! isset($args['meta_query'])) {
            $args['meta_query'] = array();
        }
        $args['meta_query'][] = array(
            'key'     => 'direction',
            'value'   => $selected_directions,
            'compare' => 'IN',
        );
    }



    $techniques = get_posts($args);
    $data = array();

    foreach ($techniques as $technique) {
        $acf_fields = get_fields($technique->ID);

        $image_url = null;
        if (!empty($acf_fields['image']) && is_array($acf_fields['image'])) {
            $image_url = $acf_fields['image']['sizes']['large'] ?? $acf_fields['image']['url'] ?? null;
        }

        // Récupération des termes de la taxonomie 'position'
        $positions = wp_get_post_terms($technique->ID, 'position', array('fields' => 'names'));

        $data[] = array(
            'id'        => $technique->ID,
            'title'     => $technique->post_title,
            'position'  => $positions,
            'acf'       => array(
                'ceinture'                 => $acf_fields['ceinture'] ?? null,
                'traduction'               => $acf_fields['traduction'] ?? null,
                'type'                     => $acf_fields['type'] ?? null,
                'mouvement'                => $acf_fields['mouvement'] ?? null,
                'direction'                => $acf_fields['direction'] ?? null,
                'image'                    => $image_url,
                'lien_video_demonstration' => $acf_fields['lien_video_demonstration'] ?? null,
            ),
        );
    }
    return new WP_REST_Response($data, 200);
}

/**
 * Fonction de callback pour récupérer une technique spécifique par son ID,
 * et une sélection de techniques similaires.
 *
 * @param WP_REST_Request $request L'objet requête.
 * @return WP_REST_Response|WP_Error
 */
function get_judodex_technique_by_id($request)
{
    $id = (int) $request['id'];
    $post = get_post($id);

    // Vérifie si le post existe, s'il est du bon type et s'il est publié
    if (!$post || $post->post_type !== 'technique-de-judo' || $post->post_status !== 'publish') {
        return new WP_Error('not_found', 'Technique non trouvée.', array('status' => 404));
    }

    $acf_fields = get_fields($post->ID);

    $image_url = null;
    if (!empty($acf_fields['image']) && is_array($acf_fields['image'])) {
        $image_url = $acf_fields['image']['sizes']['large'] ?? $acf_fields['image']['url'] ?? null;
    }

    $positions = wp_get_post_terms($post->ID, 'position', array('fields' => 'names'));

    $data = array(
        'id'        => $post->ID,
        'title'     => $post->post_title,
        'position'  => $positions,
        'acf'       => array(
            'ceinture'                 => $acf_fields['ceinture'] ?? null,
            'traduction'               => $acf_fields['traduction'] ?? null,
            'type'                     => $acf_fields['type'] ?? null,
            'mouvement'                => $acf_fields['mouvement'] ?? null,
            'direction'                => $acf_fields['direction'] ?? null,
            'image'                    => $image_url,
            'lien_video_demonstration' => $acf_fields['lien_video_demonstration'] ?? null,
        ),
    );

    // --- LOGIQUE POUR LES TECHNIQUES SIMILAIRES ---
    $related_techniques_data = array();

    // On cherche les techniques ayant le même "mouvement" (champ ACF)
    $main_technique_mouvement = $acf_fields['mouvement'] ?? null; // <-- Correction ici

    if (!empty($main_technique_mouvement)) {
        $related_args = array(
            'post_type'      => 'technique-de-judo',
            'posts_per_page' => 4, // Limite à 4 techniques similaires
            'post_status'    => 'publish',
            'post__not_in'   => array($post->ID), // Exclure la technique actuelle
            'meta_query'     => array(
                array(
                    'key'     => 'mouvement', // On filtre bien sur le champ "mouvement"
                    'value'   => $main_technique_mouvement,
                    'compare' => '=',
                ),
            ),
            'orderby'        => 'rand',
        );

        $related_techniques = get_posts($related_args);

        foreach ($related_techniques as $related_tech_post) {
            $related_acf_fields = get_fields($related_tech_post->ID);
            $related_image_url = null;
            if (!empty($related_acf_fields['image']) && is_array($related_acf_fields['image'])) {
                $related_image_url = $related_acf_fields['image']['sizes']['medium'] ?? $related_acf_fields['image']['url'] ?? null;
            }

            $related_positions = wp_get_post_terms($related_tech_post->ID, 'position', array('fields' => 'names'));

            $related_techniques_data[] = array(
                'id'       => $related_tech_post->ID,
                'title'    => $related_tech_post->post_title,
                'image'    => $related_image_url,
                'position' => $related_positions,
            );
        }
    }

    // Ajoute les techniques similaires à la réponse principale
    $data['related_techniques'] = $related_techniques_data;
    // --- FIN LOGIQUE POUR LES TECHNIQUES SIMILAIRES ---

    return new WP_REST_Response($data, 200);
}

/**
 * Récupère toutes les positions uniques des techniques de judo.
 *
 * @return WP_REST_Response
 */
function get_judodex_positions()
{
    $terms = get_terms(array(
        'taxonomy'   => 'position',
        'hide_empty' => true,
    ));

    $positions = array_map(function ($term) {
        return $term->name;
    }, $terms);

    return new WP_REST_Response($positions, 200);
}

/**
 * Récupère toutes les valeurs uniques du champ ACF 'ceinture'.
 *
 * @return WP_REST_Response
 */
function get_judodex_ceintures()
{
    $ceintures = array();
    $posts = get_posts(array(
        'post_type'      => 'technique-de-judo',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ));

    foreach ($posts as $post) {
        $ceinture = get_field('ceinture', $post->ID);
        if (!empty($ceinture) && !in_array($ceinture, $ceintures)) {
            $ceintures[] = $ceinture;
        }
    }
    sort($ceintures);
    return new WP_REST_Response($ceintures, 200);
}

/**
 * Récupère toutes les valeurs uniques du champ ACF 'type'.
 *
 * @return WP_REST_Response
 */
function get_judodex_types()
{
    $types = array();
    $posts = get_posts(array(
        'post_type'      => 'technique-de-judo',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ));

    foreach ($posts as $post) {
        $type = get_field('type', $post->ID);
        if (!empty($type) && !in_array($type, $types)) {
            $types[] = $type;
        }
    }
    sort($types);
    return new WP_REST_Response($types, 200);
}

/**
 * Récupère toutes les valeurs uniques du champ ACF 'mouvement'.
 *
 * @return WP_REST_Response
 */
function get_judodex_mouvements()
{
    $mouvements = array();
    $posts = get_posts(array(
        'post_type'      => 'technique-de-judo',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ));

    foreach ($posts as $post) {
        $mouvement = get_field('mouvement', $post->ID);
        if (!empty($mouvement) && !in_array($mouvement, $mouvements)) {
            $mouvements[] = $mouvement;
        }
    }
    sort($mouvements);
    return new WP_REST_Response($mouvements, 200);
}

/**
 * Récupère toutes les valeurs uniques du champ ACF 'direction'.
 *
 * @return WP_REST_Response
 */
function get_judodex_directions()
{
    $directions = array();
    $posts = get_posts(array(
        'post_type'      => 'technique-de-judo',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ));

    foreach ($posts as $post) {
        $direction = get_field('direction', $post->ID);
        if (!empty($direction) && !in_array($direction, $directions)) {
            $directions[] = $direction;
        }
    }
    sort($directions);
    return new WP_REST_Response($directions, 200);
}